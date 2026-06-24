import type { Layer1GraphState } from '../types/graph.types';
import { allQuestionCategories } from '../utils/questionCategories';

export function getCompletenessPrompt(state: Layer1GraphState): string {
  const { understanding } = state;

  return `You are an expert system architect evaluating the completeness of a system design.
Your goal is to assess the current structured understanding and generate a completeness report.

Current System Understanding (JSON):
${JSON.stringify(understanding, null, 2)}

Instructions:
1. Evaluate the system understanding across all major architectural dimensions.
2. Score the overall completeness (0 to 100).
3. Determine if the understanding is sufficient to proceed to diagram generation (readyForDiagram) and specification generation (readyForSpec). Usually a score > 80 is required.
4. Assess each of the following categories: ${allQuestionCategories.join(', ')}.
5. For each category, assign a status ('complete', 'weak', 'missing', 'not_applicable'), a score (0 to 100), and brief notes.
6. Identify critical missing items that block the design from being actionable.
7. Identify weak items that need more detail.
8. Suggest the most important category for the next clarification question.

Output MUST be a valid JSON object matching this schema:
{
  "overallScore": 0,
  "readyForSpec": false,
  "readyForDiagram": false,
  "categories": [
    { "category": "goal", "status": "weak", "score": 50, "notes": "Needs more detail." }
  ],
  "missingCriticalItems": ["Core workflow steps"],
  "weakItems": ["User roles"],
  "suggestedNextQuestionCategory": "workflow"
}

Output MUST be valid JSON only. Do not wrap in markdown or add explanations.
`;
}
