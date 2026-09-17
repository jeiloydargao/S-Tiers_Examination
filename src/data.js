export const topics = [
  {
    id: 'software',
    index: '01',
    title: 'Software Engineering',
    blurb: 'SDLC, coding practices, testing, and version control.',
    icon: 'code',
  },
  {
    id: 'data',
    index: '02',
    title: 'Data Management',
    blurb: 'Databases, modeling, SQL, and data governance.',
    icon: 'data',
  },
  {
    id: 'security',
    index: '03',
    title: 'System Architecture and Information Security',
    blurb: 'Architecture patterns, networks, and security controls.',
    icon: 'shield',
  },
  {
    id: 'business',
    index: '04',
    title: 'IT Business',
    blurb: 'Governance, service management, and IT strategy.',
    icon: 'brief',
  },
]

// The actual questions live in "question-bank.xlsx" (project root) and are
// compiled into src/questionBank.js by `npm run build:questions`. See
// QUESTIONS.md for the authoring guide.
export { questionBank } from './questionBank.js'
