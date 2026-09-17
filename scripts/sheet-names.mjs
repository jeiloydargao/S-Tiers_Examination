// Excel tab names are capped at 31 characters, so a couple of topic titles
// need a shorter alias here. Both build-questions.mjs and init-template.mjs
// use this mapping to find/create the right sheet for each topic.
export const SHEET_NAMES = {
  software: 'Software Engineering',
  data: 'Data Management',
  security: 'System Architecture & InfoSec',
  business: 'IT Business',
}
