import type { Layer1GraphState } from '../types/graph.types';
import { compactJson } from '../utils/llmContextFormat';
import { suggestedQuestionCategoryExamples } from '../utils/questionCategories';

export function getCompletenessPrompt(state: Layer1GraphState): string {
  return `You are an expert system architect checking diagram readiness.

CURRENT_UNDERSTANDING
${compactJson(state.understanding)}

RULES
1. Score completeness from 0 to 100.
2. Evaluate readyForDiagram only.
3. readyForDiagram is true only when enough information exists for an initial architecture, workflow, or entity diagram.
4. Do not evaluate final Markdown readiness.
5. Use short snake_case category names.
6. Example categories: ${suggestedQuestionCategoryExamples.join(',')}.
7. Identify critical missing items blocking diagram generation.
8. Identify weak items that would improve the diagram.
9. Suggest the most important next question category when not ready.

Return valid JSON only:
{"overallScore":0,"readyForDiagram":false,"categories":[{"category":"workflow","status":"weak","score":50,"notes":"Needs clearer main flow."}],"missingCriticalItems":["Core workflow steps"],"weakItems":["User roles"],"suggestedNextQuestionCategory":"workflow"}`;
}
