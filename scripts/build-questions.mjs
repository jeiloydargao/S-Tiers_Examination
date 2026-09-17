#!/usr/bin/env node
// Reads "question-bank.xlsx" (one sheet per topic) and compiles it into
// src/questionBank.js, which the app imports at runtime.
//
// Run manually with `npm run build:questions`, or it runs automatically
// before `npm run dev` / `npm run build`.

import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'
import { topics } from '../src/data.js'
import { SHEET_NAMES } from './sheet-names.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const workbookPath = path.join(root, 'question-bank.xlsx')
const outPath = path.join(root, 'src', 'questionBank.js')

function fail(message) {
  console.error(`\n[build-questions] ${message}\n`)
  process.exit(1)
}

if (!existsSync(workbookPath)) {
  fail(
    `Could not find "question-bank.xlsx" in the project root.\n` +
      `See QUESTIONS.md for how to create it.`,
  )
}

function cellText(value) {
  return String(value ?? '').trim()
}

function cluesFrom(row, fallback) {
  const clues = [row.Clue1, row.Clue2, row.Clue3].map(cellText).filter(Boolean)
  return clues.length ? clues : [fallback]
}

function shuffle(list) {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function buildQuestionsForSheet(rows, topicTitle, warnings) {
  const questions = []
  const matchGroups = new Map()

  rows.forEach((row, i) => {
    const rowNum = i + 2 // +1 for header row, +1 for 0-index
    const type = cellText(row.Type).toUpperCase()
    if (!type) return // blank spacer row

    if (type === 'TF') {
      const prompt = cellText(row.Prompt)
      const answerRaw = cellText(row.Answer).toUpperCase()
      if (!prompt) {
        warnings.push(`${topicTitle} row ${rowNum}: missing Prompt, skipped.`)
        return
      }
      if (answerRaw !== 'TRUE' && answerRaw !== 'FALSE') {
        warnings.push(`${topicTitle} row ${rowNum}: Answer must be TRUE or FALSE, skipped.`)
        return
      }
      questions.push({
        type: 'tf',
        prompt,
        answer: answerRaw === 'TRUE',
        clues: cluesFrom(row, 'Re-read the statement carefully and try again.'),
      })
      return
    }

    if (type === 'MCQ') {
      const prompt = cellText(row.Prompt)
      const options = ['OptionA', 'OptionB', 'OptionC', 'OptionD'].map((key) => cellText(row[key])).filter(Boolean)
      const answerLetter = cellText(row.Answer).toUpperCase()
      const answerIndex = 'ABCD'.indexOf(answerLetter)
      if (!prompt || options.length < 2) {
        warnings.push(`${topicTitle} row ${rowNum}: needs a Prompt and at least 2 options, skipped.`)
        return
      }
      if (answerIndex < 0 || answerIndex >= options.length) {
        warnings.push(`${topicTitle} row ${rowNum}: Answer must be a letter (A-D) matching a filled option, skipped.`)
        return
      }
      questions.push({
        type: 'mcq',
        prompt,
        options,
        answer: answerIndex,
        clues: cluesFrom(row, 'Eliminate the choices that are clearly off-topic first.'),
      })
      return
    }

    if (type === 'MATCH') {
      const group = cellText(row.MatchGroup)
      const left = cellText(row.MatchLeft)
      const right = cellText(row.MatchRight)
      if (!group || !left || !right) {
        warnings.push(`${topicTitle} row ${rowNum}: MATCH rows need MatchGroup, MatchLeft, and MatchRight, skipped.`)
        return
      }
      if (!matchGroups.has(group)) matchGroups.set(group, { prompt: '', clues: [], pairs: [] })
      const entry = matchGroups.get(group)
      const prompt = cellText(row.Prompt)
      if (prompt && !entry.prompt) entry.prompt = prompt
      if (!entry.clues.length) {
        const clues = [row.Clue1, row.Clue2, row.Clue3].map(cellText).filter(Boolean)
        if (clues.length) entry.clues = clues
      }
      entry.pairs.push({ left, right })
      return
    }

    warnings.push(`${topicTitle} row ${rowNum}: unknown Type "${row.Type}", skipped.`)
  })

  matchGroups.forEach((entry, group) => {
    if (entry.pairs.length < 2) {
      warnings.push(`${topicTitle} match group "${group}": needs at least 2 pairs, skipped.`)
      return
    }
    const rightItems = entry.pairs.map((pair, idx) => ({ id: `${group}-${idx}`, text: pair.right }))
    const answer = {}
    entry.pairs.forEach((pair, idx) => {
      answer[pair.left] = rightItems[idx].id
    })
    questions.push({
      type: 'match',
      prompt: entry.prompt || 'Match each term with its correct meaning.',
      left: entry.pairs.map((pair) => pair.left),
      right: shuffle(rightItems),
      answer,
      clues: entry.clues.length
        ? entry.clues
        : ['These pairs relate to one shared theme — think through each definition on its own.'],
    })
  })

  return questions
}

const workbook = XLSX.readFile(workbookPath)
const bank = {}
const warnings = []

for (const topic of topics) {
  const expected = SHEET_NAMES[topic.id] ?? topic.title
  const sheetName = workbook.SheetNames.find((name) => name.trim().toLowerCase() === expected.trim().toLowerCase())
  if (!sheetName) {
    warnings.push(`No sheet named "${expected}" found in question-bank.xlsx — that topic will have 0 questions.`)
    bank[topic.id] = []
    continue
  }
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' })
  bank[topic.id] = buildQuestionsForSheet(rows, topic.title, warnings)
}

mkdirSync(path.dirname(outPath), { recursive: true })
const header =
  `// AUTO-GENERATED by scripts/build-questions.mjs — do not edit by hand.\n` +
  `// Edit "question-bank.xlsx" instead, then re-run \`npm run build:questions\`.\n\n`
writeFileSync(outPath, `${header}export const questionBank = ${JSON.stringify(bank, null, 2)}\n`)

console.log(`[build-questions] Wrote ${path.relative(root, outPath)}`)
console.log(
  `[build-questions] Question counts — ${topics.map((t) => `${t.title}: ${bank[t.id].length}`).join(', ')}`,
)
if (warnings.length) {
  console.warn(`\n[build-questions] ${warnings.length} warning(s):`)
  warnings.forEach((w) => console.warn(`  - ${w}`))
}
