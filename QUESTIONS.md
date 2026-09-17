# Adding your own exam questions

Yes — use Excel (or Google Sheets, exported as `.xlsx`). You don't need to touch any code.

All content lives in one workbook, **`question-bank.xlsx`**, in the project root. It's created
automatically the first time you run `npm run dev` (with a few starter questions already filled
in). Open it in Excel and start editing.

## How it works

- The workbook has **one sheet per topic**. The sheet names must be exactly:
  - `Software Engineering`
  - `Data Management`
  - `System Architecture & InfoSec`
  - `IT Business`
- Every time you run `npm run dev` or `npm run build`, the workbook is automatically compiled into
  `src/questionBank.js`, which is what the app actually loads. You can also trigger this manually:

  ```
  npm run build:questions
  ```

  Then refresh the app in your browser.
- Warnings for bad/skipped rows are printed to the terminal — check there if a question doesn't
  show up.

## Columns

Each sheet uses the same 13 columns. Leave a cell blank if it doesn't apply to that row's type.

| Column | Used by | Meaning |
|---|---|---|
| `Type` | all | `TF`, `MCQ`, or `MATCH` |
| `Prompt` | all | The question text (for `MATCH`, only needs to be filled on the first row of the group) |
| `OptionA`…`OptionD` | MCQ | Up to 4 answer choices |
| `Answer` | TF, MCQ | `TRUE`/`FALSE` for TF; the letter (`A`–`D`) of the correct option for MCQ |
| `MatchGroup` | MATCH | An ID shared by every row that belongs to the same matching question (e.g. `M1`) |
| `MatchLeft` | MATCH | One term for this pair |
| `MatchRight` | MATCH | The correct meaning for that term |
| `Clue1`, `Clue2`, `Clue3` | all | Optional hints shown one at a time on wrong practice attempts |

### True/False row

| Type | Prompt | Answer | Clue1 |
|---|---|---|---|
| TF | TCP guarantees ordered delivery of packets. | TRUE | Think about what "connection-oriented" means. |

### Multiple choice row

| Type | Prompt | OptionA | OptionB | OptionC | OptionD | Answer |
|---|---|---|---|---|---|---|
| MCQ | Which layer handles routing? | Application | Network | Session | Physical | B |

### Matching rows (one row per pair, same `MatchGroup`)

| Type | Prompt | MatchGroup | MatchLeft | MatchRight |
|---|---|---|---|---|
| MATCH | Match each OSI layer to its role. | M1 | Network | Routing between networks |
| MATCH |  | M1 | Transport | End-to-end delivery |
| MATCH |  | M1 | Physical | Raw bit transmission |

The app randomizes the display order of the right-hand column automatically — you don't need to
scramble it yourself.

## Notes

- Up to 100 questions can be selected per session; add as many rows as you like per topic, the
  Setup screen's slider just picks a random subset each time someone starts a session.
- `src/questionBank.js` is auto-generated (and git-ignored) — never edit it directly, your changes
  will be overwritten. Edit `question-bank.xlsx` instead.
- `question-bank.xlsx` itself **is** committed to git — it's your real content, back it up like any
  other source file.
