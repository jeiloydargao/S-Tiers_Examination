#!/usr/bin/env node
// One-time helper: creates question-bank.xlsx in the project root with the
// correct headers/sheet names and a few starter rows per topic. Safe to run
// again — it will NOT overwrite an existing file.

import { existsSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'
import { topics } from '../src/data.js'
import { SHEET_NAMES } from './sheet-names.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outPath = path.join(root, 'question-bank.xlsx')

if (existsSync(outPath)) {
  console.log('[init-template] question-bank.xlsx already exists — leaving it alone.')
  process.exit(0)
}

const headers = [
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

const starterRows = [
  {
    Type: 'TF',
    Prompt: 'In a relational database, a foreign key must always reference a unique value in another table.',
    Answer: 'TRUE',
    Clue1: 'Think about how tables stay connected without duplicating whole records.',
    Clue2: 'A foreign key points to a primary key — and primary keys are unique.',
  },
  {
    Type: 'MCQ',
    Prompt: 'Which practice best reduces the chance of introducing defects during software delivery?',
    OptionA: 'Deploying directly from a developer workstation',
    OptionB: 'Automated tests in a repeatable pipeline',
    OptionC: 'Skipping code review for small changes',
    OptionD: 'Writing documentation after go-live only',
    Answer: 'B',
    Clue1: 'Look for the option that catches mistakes before production.',
    Clue2: 'Continuous integration with automated tests is the strongest control here.',
  },
  {
    Type: 'MATCH',
    Prompt: 'Match each security concept with its meaning.',
    MatchGroup: 'M1',
    MatchLeft: 'Confidentiality',
    MatchRight: 'Information is disclosed only to authorized parties',
    Clue1: 'These three terms are the CIA triad.',
    Clue2: 'Confidentiality = secrecy, Integrity = accuracy, Availability = uptime.',
  },
  { Type: 'MATCH', MatchGroup: 'M1', MatchLeft: 'Integrity', MatchRight: 'Data is accurate and has not been tampered with' },
  { Type: 'MATCH', MatchGroup: 'M1', MatchLeft: 'Availability', MatchRight: 'Authorized users can access systems when needed' },
]

const workbook = XLSX.utils.book_new()

for (const topic of topics) {
  const rows = starterRows.map((row) => ({ ...row }))
  const sheet = XLSX.utils.json_to_sheet(rows, { header: headers })
  sheet['!cols'] = headers.map((h) => ({ wch: h === 'Prompt' || h.startsWith('Option') || h === 'MatchRight' ? 32 : 14 }))
  XLSX.utils.book_append_sheet(workbook, sheet, SHEET_NAMES[topic.id] ?? topic.title)
}

XLSX.writeFile(workbook, outPath)
console.log(`[init-template] Created ${path.relative(root, outPath)} with sheets: ${topics.map((t) => t.title).join(', ')}`)
