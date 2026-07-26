import type { Layer1GraphState } from '../types/graph.types';
import type {
  Layer1CanonicalArtifact,
} from '../types/layer1.types';
import { createIsoTimestamp } from './id';

export function buildLayer1CanonicalArtifact(
  state: Layer1GraphState,
): Layer1CanonicalArtifact {
  if (!state.diagramApproved) {
    throw new Error(
      'Task 7 requires an approved final diagram.',
    );
  }

  if (
    !state.selectedDiagramRenderer
  ) {
    throw new Error(
      'Task 7 requires selecting either Draw.io or Mermaid as the approved final renderer.',
    );
  }

  if (!state.drawioXml.trim()) {
    throw new Error(
      'Task 7 requires the Draw.io diagram source.',
    );
  }

  if (!state.mermaidSource.trim()) {
    throw new Error(
      'Task 7 requires the Mermaid diagram source.',
    );
  }

  if (!state.diagramGenerationContext) {
    throw new Error(
      'Task 7 requires the Task 4 diagram generation context.',
    );
  }

  const context = state.diagramGenerationContext;

  return {
    version: '1.0',
    runId: state.runId,
    generatedAt: createIsoTimestamp(),

    system: {
      summary: state.understanding.summary,
      goal: state.understanding.goal,
      understanding: state.understanding,
      completeness: state.completeness,
    },

    clarification: {
      answeredQuestions: context.answeredQuestions,
      unansweredQuestions: context.unansweredQuestions,
    },

    diagram: {
      summary: state.diagramSummary,
      approved: state.diagramApproved,
      revisionCount: state.diagramRevisions.length,
    },
  };
}
