import type { Layer1GraphState } from '../types/graph.types';

import { compactJson } from '../utils/llmContextFormat';
import { buildSlimQuestionContext } from '../utils/systemDesignAiContext';

import { suggestedQuestionCategoryExamples } from '../utils/questionCategories';

function getQuestionAntiRepetitionContext(state: Layer1GraphState): string {
  return compactJson(
    buildSlimQuestionContext({
      understanding: state.understanding,
      completeness: state.completeness,
      currentQuestion: state.currentQuestion,
      questions: state.questions,
      conversation: state.conversation,
    })
  );
}

export function getConstructiveQuestionPrompt(state: Layer1GraphState): string {
  const antiRepetitionContext = getQuestionAntiRepetitionContext(state);

  return `You are a senior system architect conducting an adaptive architecture clarification interview.

Generate exactly ONE highest-value constructive question.

The compact clarification context is the canonical source of truth.

Do NOT request the original system description.

Do NOT reconstruct previous conversation history.

Use the provided recent question history ONLY to avoid repetition.
Do not ask for information already present in the compact context.

COMPACT_CLARIFICATION_CONTEXT
${antiRepetitionContext}

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

ANTI-REPETITION RULES

1. Never ask the same question as the currentPendingQuestion.
2. Never ask a question that is semantically similar to any answeredQuestionHistory question.
3. Never ask for information that is already answered in CURRENT_UNDERSTANDING.
4. Do not repeat the same topic using different wording.
5. If a category was already asked and answered, move to a different missing category.
6. If the pending question is still unanswered, do not generate another version of it.
7. Prefer gaps that are weak, empty, vague, assumed, or missing in CURRENT_UNDERSTANDING.
8. If the most obvious question was already asked, choose the next most valuable different architectural gap.

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
10. Before asking, verify that the answer cannot already be inferred from workflows, business rules, actors, entities, integrations, decisions, constraints, or existing assumptions.
11. When the description is already detailed, ask only about a genuinely unresolved architectural decision with high impact.
12. Prefer questions about ownership, trust boundaries, failure recovery, consistency, concurrency, scaling, or operational behavior over asking the user to restate workflow steps.
13. Never ask the user to enumerate decisions, actors, steps, entities, or integrations that are already represented in CURRENT_UNDERSTANDING.
14. Avoid broad prompts such as "what are the decision points", "describe the workflow", or "what integrations are needed" when concrete examples already exist.
15. If no critical factual gap remains, ask for the most consequential design preference or explicitly unresolved tradeoff instead.

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
- do not repeat currentPendingQuestion
- do not repeat answeredQuestionHistory
- choose a new architectural gap

Return JSON only.

Before finishing, verify every string, array, and object is closed.`;
}
