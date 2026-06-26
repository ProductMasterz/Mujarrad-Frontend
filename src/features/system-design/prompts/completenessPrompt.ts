import type { Layer1GraphState } from '../types/graph.types';
import { suggestedQuestionCategoryExamples } from '../utils/questionCategories';

export function getCompletenessPrompt(state: Layer1GraphState): string {
  return `You are an expert system architect evaluating whether the clarified understanding is ready for diagram generation.

Current System Understanding:
${JSON.stringify(state.understanding, null, 2)}

Instructions:
1. Evaluate completeness from 0 to 100.
2. Determine readyForDiagram only.
3. readyForDiagram should be true only when the system is clear enough to generate an initial architecture/workflow/entity diagram.
4. Do NOT evaluate final Markdown/specification readiness here.
5. Categories are open-ended. Use short snake_case category names.
6. Suggested example categories: ${suggestedQuestionCategoryExamples.join(', ')}.
7. Identify critical missing items that block diagram generation.
8. Identify weak items that would improve the diagram.
9. Suggest the most important next question category if not ready.

Return valid JSON only:
{
  "overallScore": 0,
  "readyForDiagram": false,
  "categories": [
    { "category": "workflow", "status": "weak", "score": 50, "notes": "Needs clearer main flow." }
  ],
  "missingCriticalItems": ["Core workflow steps"],
  "weakItems": ["User roles"],
  "suggestedNextQuestionCategory": "workflow"
}
`;
}
