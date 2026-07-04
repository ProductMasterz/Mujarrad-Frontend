import type { Layer1GraphState } from '../types/graph.types';
import {
  compactJson,
  compactQaHistory,
} from '../utils/llmContextFormat';
import { suggestedQuestionCategoryExamples } from '../utils/questionCategories';

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

function buildProcessedInputText(state: Layer1GraphState): string {
  if (!state.processedInput) {
    return 'none';
  }

  return compactJson(state.processedInput);
}

export function getConstructiveQuestionPrompt(state: Layer1GraphState): string {
  return `You are an expert system architect conducting a clarification interview.

Generate exactly ONE constructive clarification question.

Use processed input as the main source of truth. Never rely on raw unprocessed input.

PROCESSED_INPUT
${buildProcessedInputText(state)}

QA_HISTORY
${buildHistoryText(state)}

CURRENT_UNDERSTANDING
${compactJson(state.understanding)}

COMPLETENESS
${state.completeness ? compactJson(state.completeness) : 'none'}

RULES
1. Ask exactly one question.
2. Ask about a real gap or ambiguity.
3. Do not repeat answered questions.
4. Prioritize missingCriticalItems, weakItems, and suggestedNextQuestionCategory.
5. Category may be any short snake_case value.
6. Example categories: ${suggestedQuestionCategoryExamples.join(',')}.
7. expectedAnswerType: short_text, long_text, list, yes_no, choice, number, or structured.
8. Do not use a static questionnaire.
9. Do not generate diagram or documentation content.

Return valid JSON only:
{"question":"One clear question","category":"open_category_name","reasonForAsking":"Why this matters","expectedAnswerType":"long_text","options":[],"understandingFields":[]}`;
}
