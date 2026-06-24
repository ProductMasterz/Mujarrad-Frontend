import type { Layer1GraphState } from '../types/graph.types';

export function getUnderstandingUpdatePrompt(state: Layer1GraphState): string {
  const { rawInputs, qaHistory, understanding } = state;
  const inputTexts = rawInputs.map(r => r.rawText).join('\n---\n');
  const historyText = qaHistory.map(qa => `Q: ${qa.questionId}\nA: ${qa.answer}`).join('\n\n');

  return `You are an expert system architect managing the structured understanding of a system design.
Your goal is to update the system understanding based on new information from raw inputs and Q&A history.

Context:
Raw Inputs:
${inputTexts}

Q&A History:
${historyText || 'No history yet.'}

Current System Understanding (JSON):
${JSON.stringify(understanding, null, 2)}

Instructions:
1. Review the existing system understanding.
2. Synthesize the raw inputs and Q&A history to identify new information, corrections, or refinements.
3. Update the understanding object with this new knowledge. Be comprehensive but concise.
4. If a piece of information is ambiguous or conflicting, record it in assumptions or openQuestions.
5. Provide a realistic confidence score between 0.0 and 1.0 representing how well the system is understood.
6. The output MUST be a valid JSON object matching the SystemUnderstanding schema completely.

Output MUST be valid JSON only. Do not wrap in markdown or add explanations.
`;
}
