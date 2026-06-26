import type { Layer1GraphState } from '../types/graph.types';
import { suggestedQuestionCategoryExamples } from '../utils/questionCategories';

function buildHistoryText(state: Layer1GraphState): string {
  if (state.qaHistory.length === 0) return 'No history yet.';

  return state.qaHistory
    .map((qa) => {
      const question = state.questions.find((q) => q.id === qa.questionId);
      return `Q: ${question?.question ?? qa.questionId}\nA: ${qa.answer}`;
    })
    .join('\n\n');
}

function buildProcessedInputText(state: Layer1GraphState): string {
  const processed = state.processedInput;

  if (!processed) {
    return 'No processed input is available.';
  }

  return JSON.stringify(processed, null, 2);
}

export function getConstructiveQuestionPrompt(state: Layer1GraphState): string {
  return `You are an expert system architect conducting a clarification interview.

Your goal is to generate exactly ONE constructive clarification question that improves the system design understanding.

Use the processed input as the main source of truth. Do not depend on raw unprocessed input.

Processed Input Context:
${buildProcessedInputText(state)}

Q&A History:
${buildHistoryText(state)}

Current System Understanding:
${JSON.stringify(state.understanding, null, 2)}

Current Completeness Report:
${state.completeness ? JSON.stringify(state.completeness, null, 2) : 'No completeness report yet.'}

Instructions:
1. Ask exactly ONE question.
2. The question must be specific, useful, and based on a real gap or ambiguity.
3. Avoid repeating questions already answered.
4. If a completeness report exists, prioritize missingCriticalItems, weakItems, and suggestedNextQuestionCategory.
5. The category is open-ended. You may use any short snake_case category name that fits the gap.
6. Example categories only: ${suggestedQuestionCategoryExamples.join(', ')}.
7. expectedAnswerType must be one of: short_text, long_text, list, yes_no, choice, number, structured.
8. Do not generate a static questionnaire.
9. Do not proceed to documentation or diagram content.

Return valid JSON only:
{
  "question": "One clear question",
  "category": "open_category_name",
  "reasonForAsking": "Why this question matters",
  "expectedAnswerType": "long_text",
  "options": ["optional only if expectedAnswerType is choice"],
  "understandingFields": ["optional fields this question improves"]
}
`;
}
