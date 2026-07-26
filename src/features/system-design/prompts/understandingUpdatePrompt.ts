import type {
  Layer1GraphState,
} from '../types/graph.types';

import {
  compactJson,
} from '../utils/llmContextFormat';
import {
  buildSlimUnderstandingContext,
} from '../utils/systemDesignAiContext';

function getLatestClarification(
  state: Layer1GraphState,
): {
  question: string;
  answer: string;
} | null {
  const latestAnswer =
    state.qaHistory[
      state.qaHistory.length - 1
    ];

  if (!latestAnswer) {
    return null;
  }

  const question =
    state.questions.find(
      (item) =>
        item.id ===
        latestAnswer.questionId,
    );

  return {
    question:
      question?.question ??
      latestAnswer.questionId,

    answer:
      latestAnswer.answer,
  };
}

function buildInitialPrompt(
  state: Layer1GraphState,
): string {
  return `You are a senior system architect creating the first cumulative structured understanding of a system.

This is the INITIAL understanding pass.

Analyze the initial processed system description once.

INITIAL_PROCESSED_INPUT
${state.processedInput ? compactJson(state.processedInput) : 'none'}

OBJECTIVE

Create a complete architecture-ready SystemUnderstanding.

Extract only information supported by the input.

Identify when supported:

- system goal and business outcome
- primary users
- secondary users
- roles
- permissions
- major workflows and ordered workflow steps
- alternative workflows
- inputs
- outputs
- important entities
- business rules
- decision logic
- validation rules
- integrations
- notifications
- reporting
- security requirements
- error cases
- edge cases
- assumptions
- unresolved architectural questions

RULES

1. This is the first understanding version.
2. Do not invent technologies or behavior.
3. Capture architecture-significant facts immediately.
4. Keep equivalent concepts merged.
5. Use concise but meaningful descriptions.
6. Capture workflow steps in execution order.
7. Put genuinely unresolved architectural gaps in openQuestions.
8. confidence must be between 0 and 1.
9. Return the COMPLETE SystemUnderstanding object.
10. Return valid JSON only.
11. No markdown.
12. No code fences.
13. No commentary.

Return exactly one complete SystemUnderstanding JSON object.`;
}

function buildIncrementalPrompt(
  state: Layer1GraphState,
  clarification: {
    question: string;
    answer: string;
  },
): string {
  return `You are a senior system architect maintaining one cumulative SystemUnderstanding.

This is an INCREMENTAL update.

The existing understanding already contains all previously accepted evidence.

Do NOT re-analyze the original description.
Do NOT request or reconstruct older question-and-answer history.
Do NOT expand unsupported details.
Use the compact current understanding and latest clarification only.

CURRENT_UNDERSTANDING
${compactJson(buildSlimUnderstandingContext(state.understanding))}

LATEST_QUESTION
${clarification.question}

LATEST_ANSWER
${clarification.answer}

OBJECTIVE

Produce the next complete cumulative understanding version.

Conceptually:

Understanding N
+ latest Question
+ latest Answer
→ Understanding N+1

UPDATE RULES

1. Start from CURRENT_UNDERSTANDING.
2. Preserve correct established facts.
3. Apply the latest answer immediately.
4. The latest answer may add, refine, correct, or replace previous information.
5. Merge equivalent concepts instead of duplicating them.
6. Preserve stable existing ids for concepts that remain.
7. Add newly supported actors, workflows, entities, rules, integrations, failures, or security facts.
8. Update workflow steps when the latest answer adds meaningful sequence detail.
9. Remove resolved items from openQuestions.
10. Remove assumptions that the latest answer confirms or contradicts.
11. Do not invent technologies or product behavior.
12. Recalculate confidence from the updated cumulative understanding.
13. confidence must be between 0 and 1.
14. Return the complete updated SystemUnderstanding object, but keep text concise.
15. Do not return only the latest change.
16. Prefer short labels and compact descriptions.
17. Return valid JSON only.
18. No markdown.
19. No code fences.
20. No commentary.

Return exactly one complete updated SystemUnderstanding JSON object.`;
}

export function getUnderstandingUpdatePrompt(
  state: Layer1GraphState,
): string {
  const latestClarification =
    getLatestClarification(
      state,
    );

  if (!latestClarification) {
    return buildInitialPrompt(
      state,
    );
  }

  return buildIncrementalPrompt(
    state,
    latestClarification,
  );
}
