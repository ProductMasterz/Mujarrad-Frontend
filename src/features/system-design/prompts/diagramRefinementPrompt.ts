import type { Layer1GraphState } from '../types/graph.types';
import type {
  CurrentDiagramAnalysis,
  DiagramContextSelection,
  DiagramRefinementIntent,
  DiagramTransformationPlan,
  SemanticDiagramModel,
} from '../types/diagramIntelligence.types';
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
  refinementIntent: DiagramRefinementIntent;
  currentDiagramAnalysis?: CurrentDiagramAnalysis;
  contextSelection?: DiagramContextSelection;
  transformationPlan?: DiagramTransformationPlan;
  semanticDiagram?: SemanticDiagramModel;
}): string {
  const {
    state,
    currentXml,
    refinementInstruction,
    refinementIntent,
    currentDiagramAnalysis,
    contextSelection,
    transformationPlan,
    semanticDiagram,
  } = input;
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

REFINEMENT_INTENT
${compactJson(refinementIntent)}

CURRENT_DIAGRAM_ANALYSIS
${
  currentDiagramAnalysis
    ? compactJson(currentDiagramAnalysis)
    : 'Not required for this fast local edit.'
}

CURRENT_XML
${currentXml}

SELECTED_SYSTEM_CONTEXT
${
  contextSelection
    ? compactJson(contextSelection)
    : compactJson({
        status: relevantContext.status,
        understandingSummary:
          relevantContext.understanding.summary,
      })
}

TRANSFORMATION_PLAN
${
  transformationPlan
    ? compactJson(transformationPlan)
    : 'No expert transformation plan required for this fast local edit.'
}

TARGET_SEMANTIC_DIAGRAM
${
  semanticDiagram
    ? compactJson(semanticDiagram)
    : 'No semantic reconstruction required for this fast local edit.'
}

REVISION_HISTORY
${compactRevisionHistory(state.diagramRevisions)}

Return only the complete updated mxGraphModel XML.`;
}
