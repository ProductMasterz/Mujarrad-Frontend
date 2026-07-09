import type {
  Layer1GraphState,
} from '../types/graph.types';

import {
  compactJson,
} from '../utils/llmContextFormat';

import {
  suggestedQuestionCategoryExamples,
} from '../utils/questionCategories';

export function getConstructiveQuestionPrompt(
  state: Layer1GraphState,
): string {
  return `You are a senior system architect conducting an adaptive architecture clarification interview.

Generate exactly ONE highest-value constructive question.

The current cumulative understanding is the canonical source of truth.

Do NOT request the original system description.

Do NOT reconstruct previous conversation history.

Do NOT re-analyze previous questions and answers.

CURRENT_UNDERSTANDING
${compactJson(state.understanding)}

CURRENT_READINESS
${state.completeness ? compactJson(state.completeness) : 'none'}

OBJECTIVE

Ask the one question whose answer would most improve:

- system correctness
- architecture completeness
- system boundary clarity
- future diagram quality

CHOOSE THE GAP

Internally determine:

1. the most important unresolved architectural gap
2. whether a missingCriticalItem should be resolved first
3. whether a weakItem should be improved first
4. whether the suggestedNextQuestionCategory is still relevant

Prefer, when relevant:

1. purpose and system boundary
2. actors and entry points
3. main end-to-end workflow
4. decisions and branching
5. responsibility ownership
6. entities and data movement
7. external integrations
8. synchronous versus asynchronous behavior
9. authentication, authorization, and trust boundaries
10. failure handling and recovery
11. state transitions
12. scale and operational constraints
13. reporting, notifications, and observability
14. secondary workflows and edge cases

QUESTION RULES

1. Ask exactly one question.
2. Ask about one coherent architectural gap.
3. Make it specific to this system.
4. Do not ask about information already established.
5. Do not ask generic textbook questions.
6. Prefer behavior and responsibility before technology.
7. Keep the question concise.
8. Keep the reason concise.
9. The answer must materially improve the future diagram.

COMPACT OUTPUT

Return exactly one tiny JSON object:

{
  "q": "question text",
  "c": "short_snake_case_category",
  "r": "short reason",
  "t": "answer type",
  "f": ["SystemUnderstanding field"]
}

Allowed answer types:

short_text
long_text
list
yes_no
choice
number
structured

Example categories:

${suggestedQuestionCategoryExamples.join(', ')}

Rules:

- q: one concise question
- c: short snake_case category
- r: maximum one short sentence
- t: one allowed answer type
- f: only SystemUnderstanding fields expected to improve
- no options unless absolutely necessary
- no markdown
- no code fences
- no commentary
- no trailing text

Return JSON only.

Before finishing, verify every string, array, and object is closed.`;
}
