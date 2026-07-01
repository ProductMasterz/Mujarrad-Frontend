import { describe, expect, it } from '@jest/globals';

import { createArtifactBundleNode } from '../createArtifactBundleNode';

describe('createArtifactBundleNode', () => {
  it('uses the raw markdownSpec when there is no final documentation', async () => {
    const bundle = await createArtifactBundleNode({
      markdownSpec: '# Draft Spec',
      drawioXml: '<mxGraphModel></mxGraphModel>',
    });

    expect(bundle.markdownSpec).toBe('# Draft Spec');
    expect(bundle.finalDocumentation).toBeUndefined();
    expect(bundle.drawioXml).toBe('<mxGraphModel></mxGraphModel>');
    expect(bundle.approvedAt).toEqual(expect.any(String));
  });

  it('prefers the final documentation markdown over the raw markdownSpec when present', async () => {
    const bundle = await createArtifactBundleNode({
      markdownSpec: '# Draft Spec',
      drawioXml: '<mxGraphModel></mxGraphModel>',
      finalDocumentation: {
        markdown: '# Final Spec',
        generatedAt: '2026-01-01T00:00:00.000Z',
        approved: true,
      },
    });

    expect(bundle.markdownSpec).toBe('# Final Spec');
    expect(bundle.approvedAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('carries through the diagram image and diagram summary when provided', async () => {
    const bundle = await createArtifactBundleNode({
      markdownSpec: '# Draft Spec',
      drawioXml: '<mxGraphModel></mxGraphModel>',
      diagramImage: { format: 'png', dataUrl: 'data:image/png;base64,AAAA' },
      diagramSummary: 'Shows the checkout flow.',
    });

    expect(bundle.diagramImage).toEqual({ format: 'png', dataUrl: 'data:image/png;base64,AAAA' });
    expect(bundle.diagramSummary).toBe('Shows the checkout flow.');
  });

  it('falls back to the current time for approvedAt when there is no final documentation', async () => {
    const before = Date.now();
    const bundle = await createArtifactBundleNode({
      markdownSpec: '# Draft Spec',
      drawioXml: '<mxGraphModel></mxGraphModel>',
    });
    const after = Date.now();

    const approvedAtMs = new Date(bundle.approvedAt).getTime();
    expect(approvedAtMs).toBeGreaterThanOrEqual(before);
    expect(approvedAtMs).toBeLessThanOrEqual(after);
  });
});
