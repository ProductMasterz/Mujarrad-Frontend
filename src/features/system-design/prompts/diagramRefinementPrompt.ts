import type { Layer1GraphState } from '../types/graph.types';
import {
  compactJson,
  compactRevisionHistory,
} from '../utils/llmContextFormat';

export const DIAGRAM_REFINEMENT_SYSTEM_PROMPT = `Edit the existing Draw.io diagram.

Rules:
- Modify the existing diagram; do not create an unrelated replacement.
- Apply only the requested change.
- Preserve unaffected nodes, edges, labels, and layout where possible.
- Return only complete valid mxGraphModel XML.
- No markdown fences or explanation.
- Keep unique cell ids.
- Keep root cells 0 and 1 valid.
- Keep the layout readable and non-overlapping.`;

export function getDiagramRefinementPrompt(input: {
  state: Layer1GraphState;
  currentXml: string;
  refinementInstruction: string;
}): string {
  const { state, currentXml, refinementInstruction } = input;
  const context = state.diagramGenerationContext;

  if (!context) {
    throw new Error(
      'Diagram refinement requires diagramGenerationContext.',
    );
  }

  const relevantContext = {
    status: context.status,
    understanding: context.understanding,
    answeredQuestions: context.answeredQuestions,
    unansweredQuestions: context.unansweredQuestions,
    completeness: context.completeness,
  };

  return `REQUEST
${refinementInstruction.trim()}

CURRENT_XML
${currentXml}

SYSTEM_CONTEXT
${compactJson(relevantContext)}

REVISION_HISTORY
${compactRevisionHistory(state.diagramRevisions)}

Return only the complete updated mxGraphModel XML.`;
}
