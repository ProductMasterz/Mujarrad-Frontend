import type { Layer1GraphState } from '../types/graph.types';
import type { Layer1ArtifactBundle } from '../types/layer1.types';
import { buildLayer1ArtifactBundle } from '../utils/layer1ArtifactBundle';

export interface GenerateFinalDocsNodeResult {
  bundle: Layer1ArtifactBundle | null;
  error?: string;
}

export async function generateFinalDocsNode(
  state: Layer1GraphState,
): Promise<GenerateFinalDocsNodeResult> {
  try {
    const bundle = buildLayer1ArtifactBundle(state);

    return {
      bundle,
    };
  } catch (err) {
    return {
      bundle: null,
      error:
        err instanceof Error
          ? err.message
          : 'Final documentation generation failed.',
    };
  }
}
