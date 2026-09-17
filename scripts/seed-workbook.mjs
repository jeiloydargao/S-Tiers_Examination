#!/usr/bin/env node
// Regenerates question-bank.xlsx from the hand-written content banks in
// scripts/content/*.mjs (100 questions per topic: 40 TF, 40 MCQ, 20 matching
// sets of 4 pairs each). Overwrites the workbook — re-run any time you want
// to reset back to this curated 400-question set.

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'
import { topics } from '../src/data.js'
import { SHEET_NAMES } from './sheet-names.mjs'
import * as software from './content/software.mjs'
import * as dataManagement from './content/data-management.mjs'
import * as security from './content/security.mjs'
import * as business from './content/business.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outPath = path.join(root, 'question-bank.xlsx')

const CONTENT_BY_TOPIC = {
  software,
  data: dataManagement,
  security,
  business,
}

const HEADERS = [
  'Type',
  'Prompt',
  'OptionA',
  'OptionB',
  'OptionC',
  'OptionD',
  'Answer',
  'MatchGroup',
  'MatchLeft',
  'MatchRight',
  'Clue1',
  'Clue2',
  'Clue3',
]

function blankRow() {
  return Object.fromEntries(HEADERS.map((h) => [h, '']))
}

function tfRow([prompt, answer, ...clues]) {
  return {
    ...blankRow(),
    Type: 'TF',
    Prompt: prompt,
    Answer: answer ? 'TRUE' : 'FALSE',
    Clue1: clues[0] ?? '',
    Clue2: clues[1] ?? '',
  }
}

function mcqRow([prompt, options, answerIndex, ...clues]) {
  const row = {
    ...blankRow(),
    Type: 'MCQ',
    Prompt: prompt,
    Answer: 'ABCD'[answerIndex],
    Clue1: clues[0] ?? '',
    Clue2: clues[1] ?? '',
  }
  ;['OptionA', 'OptionB', 'OptionC', 'OptionD'].forEach((key, i) => {
    row[key] = options[i] ?? ''
  })
  return row
}

function matchRows([prompt, pairs, ...clues], groupId) {
  return pairs.map(([left, right], i) => ({
    ...blankRow(),
    Type: 'MATCH',
    Prompt: i === 0 ? prompt : '',
    MatchGroup: groupId,
    MatchLeft: left,
    MatchRight: right,
    Clue1: i === 0 ? clues[0] ?? '' : '',
    Clue2: i === 0 ? clues[1] ?? '' : '',
  }))
}

function assertCount(label, arr, expected) {
  if (arr.length !== expected) {
    throw new Error(`${label}: expected ${expected} items but found ${arr.length}`)
  }
}

const workbook = XLSX.utils.book_new()

for (const topic of topics) {
  const content = CONTENT_BY_TOPIC[topic.id]
  if (!content) throw new Error(`No content module found for topic "${topic.id}"`)

  assertCount(`${topic.title} TF`, content.tfItems, 40)
  assertCount(`${topic.title} MCQ`, content.mcqItems, 40)
  assertCount(`${topic.title} MATCH`, content.matchItems, 20)

  const rows = [
    ...content.tfItems.map(tfRow),
    ...content.mcqItems.map(mcqRow),
    ...content.matchItems.flatMap((item, i) => matchRows(item, `M${i + 1}`)),
  ]

  const sheet = XLSX.utils.json_to_sheet(rows, { header: HEADERS })
  sheet['!cols'] = HEADERS.map((h) => ({
    wch: h === 'Prompt' || h.startsWith('Option') || h === 'MatchRight' ? 34 : 14,
  }))
  XLSX.utils.book_append_sheet(workbook, sheet, SHEET_NAMES[topic.id] ?? topic.title)
}

XLSX.writeFile(workbook, outPath)
console.log(`[seed-workbook] Wrote ${path.relative(root, outPath)} — 100 questions per topic (40 TF / 40 MCQ / 20 matching sets).`)
