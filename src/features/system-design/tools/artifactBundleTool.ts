interface ArtifactBundleInput {
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

export function createArtifactBundle(
  input: ArtifactBundleInput,
) {
  return {
    markdownSpec:
      input.finalDocumentation?.markdown ??
      input.markdownSpec,

    finalDocumentation:
      input.finalDocumentation,

    drawioXml:
      input.drawioXml,

    diagramImage:
      input.diagramImage,

    diagramSummary:
      input.diagramSummary,

    approvedAt:
      input.finalDocumentation
        ?.generatedAt ??
      new Date().toISOString(),
  };
}