import type { Layer1GraphState } from '../types/graph.types';
import { allQuestionCategories } from '../utils/questionCategories';

export function getConstructiveQuestionPrompt(state: Layer1GraphState): string {
  const { rawInputs, qaHistory, understanding, completeness } = state;
  const inputTexts = rawInputs.map(r => r.rawText).join('\n---\n');
  const historyText = qaHistory.map(qa => `Q: ${qa.questionId}\nA: ${qa.answer}`).join('\n\n');

  return `You are an expert system architect conducting a clarification interview.
Your goal is to generate exactly ONE constructive clarification question to improve our understanding of the system being designed.

Context:
Raw Inputs:
${inputTexts}

Q&A History:
${historyText || 'No history yet.'}

Current System Understanding (JSON):
${JSON.stringify(understanding, null, 2)}

Current Completeness Report (JSON):
${completeness ? JSON.stringify(completeness, null, 2) : 'No completeness report yet.'}

Instructions:
1. Review the current system understanding and identify missing or ambiguous information.
2. If there is a completeness report, prioritize the weak or missing items, or the suggested next question category.
3. Formulate EXACTLY ONE clear, concise question that helps clarify the system design.
4. Provide a reason for asking this question.
5. Choose an appropriate category from: ${allQuestionCategories.join(', ')}.
6. Select an expected answer type: 'short_text', 'long_text', 'list', 'yes_no', 'choice', 'number', 'structured'.

Output MUST be a valid JSON object matching this schema:
{
  "question": "The question text",
  "category": "The question category",
  "reasonForAsking": "Why this question is important",
  "expectedAnswerType": "long_text"
}
`;
}
