import type { Layer1GraphState } from '../types/graph.types';
import {
  compactJson,
  compactQaHistory,
} from '../utils/llmContextFormat';

function buildHistoryText(state: Layer1GraphState): string {
  return compactQaHistory(
    state.qaHistory.map((qa) => {
      const question = state.questions.find((q) => q.id === qa.questionId);

      return {
        question: question?.question ?? qa.questionId,
        answer: qa.answer,
      };
    }),
  );
}

export function getUnderstandingUpdatePrompt(state: Layer1GraphState): string {
  return `You are an expert system architect maintaining structured system understanding.

Update the existing SystemUnderstanding using the processed input and complete Q&A history.

PROCESSED_INPUT
${state.processedInput ? compactJson(state.processedInput) : 'none'}

QA_HISTORY
${buildHistoryText(state)}

CURRENT_UNDERSTANDING
${compactJson(state.understanding)}

RULES
1. Return the COMPLETE updated SystemUnderstanding object.
2. Preserve correct existing information unless new answers update it.
3. Add discovered users, roles, workflows, entities, rules, inputs, outputs, edge cases, security needs, integrations, notifications, and reporting requirements.
4. Put ambiguity in openQuestions.
5. Put reasonable inferred details in assumptions.
6. Use stable string ids for nested objects when possible.
7. confidence must be between 0 and 1.
8. Return valid JSON only. No markdown.`;
}
