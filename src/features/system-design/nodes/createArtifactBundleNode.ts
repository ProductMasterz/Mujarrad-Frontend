import { createArtifactBundle } from '../tools/artifactBundleTool';

interface CreateArtifactBundleInput {
  markdownSpec: string;

  finalDocumentation?: {
    markdown: string;
    generatedAt: string;
    approved: boolean;
  };

  drawioXml: string;

  diagramImage?: {
    format: 'png' | 'svg';
    dataUrl?: string;
    fileName?: string;
  };

  diagramSummary?: string;
}

export async function createArtifactBundleNode(
  input: CreateArtifactBundleInput,
) {
  return createArtifactBundle(input);
}