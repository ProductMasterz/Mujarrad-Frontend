import type { Layer1GraphState } from '../types/graph.types';

function buildHistoryText(state: Layer1GraphState): string {
  if (state.qaHistory.length === 0) return 'No history yet.';

  return state.qaHistory
    .map((qa) => {
      const question = state.questions.find((q) => q.id === qa.questionId);
      return `Q: ${question?.question ?? qa.questionId}\nA: ${qa.answer}`;
    })
    .join('\n\n');
}

export function getUnderstandingUpdatePrompt(state: Layer1GraphState): string {
  const processed = state.processedInput;

  return `You are an expert system architect maintaining a structured system understanding.

Update the existing SystemUnderstanding object using the processed input and the Q&A history.

Processed Input Context:
${processed ? JSON.stringify(processed, null, 2) : 'No processed input available.'}

Q&A History:
${buildHistoryText(state)}

Current System Understanding:
${JSON.stringify(state.understanding, null, 2)}

Instructions:
1. Return the COMPLETE updated SystemUnderstanding object.
2. Preserve correct existing information unless the latest answer clearly updates it.
3. Add new entities, workflows, rules, inputs, outputs, edge cases, security needs, integrations, notifications, and reporting requirements when discovered.
4. Put ambiguity into openQuestions.
5. Put reasonable inferred details into assumptions.
6. Use stable string ids for nested objects when possible.
7. confidence must be between 0 and 1.
8. Return valid JSON only. No markdown.
`;
}
