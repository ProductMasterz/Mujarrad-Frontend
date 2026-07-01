import { describe, expect, it } from '@jest/globals';

import { SYSTEM_DESIGN_CONFIG } from '../../config/systemDesignConfig';
import type { Layer1ArtifactBundle } from '../../types/layer1.types';
import {
  buildLayer1ExportFiles,
  getLayer1ExportSummary,
  isLayer1BundleExportable,
} from '../exportLayer1';

function buildBundle(overrides: Partial<Layer1ArtifactBundle> = {}): Layer1ArtifactBundle {
  return {
    markdownSpec: '# System Overview\n\nDetails here.',
    drawioXml: '<mxGraphModel></mxGraphModel>',
    approvedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('isLayer1BundleExportable', () => {
  it('returns false for null or undefined bundles', () => {
    expect(isLayer1BundleExportable(null)).toBe(false);
    expect(isLayer1BundleExportable(undefined)).toBe(false);
  });

  it('returns false when markdownSpec is empty or whitespace only', () => {
    expect(isLayer1BundleExportable(buildBundle({ markdownSpec: '' }))).toBe(false);
    expect(isLayer1BundleExportable(buildBundle({ markdownSpec: '   ' }))).toBe(false);
  });

  it('returns false when drawioXml is empty or whitespace only', () => {
    expect(isLayer1BundleExportable(buildBundle({ drawioXml: '' }))).toBe(false);
  });

  it('returns true when both markdownSpec and drawioXml have content', () => {
    expect(isLayer1BundleExportable(buildBundle())).toBe(true);
  });
});

describe('buildLayer1ExportFiles', () => {
  it('always includes the markdown spec and drawio xml files', () => {
    const files = buildLayer1ExportFiles(buildBundle());
    const fileNames = files.map((file) => file.fileName);

    expect(fileNames).toContain(SYSTEM_DESIGN_CONFIG.exportFiles.markdownSpec);
    expect(fileNames).toContain(SYSTEM_DESIGN_CONFIG.exportFiles.drawioXml);
  });

  it('uses utf-8 text encoding for markdown and xml files', () => {
    const files = buildLayer1ExportFiles(buildBundle());
    const markdownFile = files.find(
      (file) => file.fileName === SYSTEM_DESIGN_CONFIG.exportFiles.markdownSpec,
    );

    expect(markdownFile?.encoding).toBe('utf-8');
    expect(markdownFile?.content).toBe(buildBundle().markdownSpec);
  });

  it('omits the diagram summary file when diagramSummary is absent', () => {
    const files = buildLayer1ExportFiles(buildBundle());
    const fileNames = files.map((file) => file.fileName);

    expect(fileNames).not.toContain(SYSTEM_DESIGN_CONFIG.exportFiles.diagramSummary);
  });

  it('includes the diagram summary file when diagramSummary has content', () => {
    const files = buildLayer1ExportFiles(
      buildBundle({ diagramSummary: 'This diagram shows the checkout flow.' }),
    );
    const summaryFile = files.find(
      (file) => file.fileName === SYSTEM_DESIGN_CONFIG.exportFiles.diagramSummary,
    );

    expect(summaryFile).toBeDefined();
    expect(summaryFile?.content).toBe('This diagram shows the checkout flow.');
  });

  it('omits the diagram image file when there is no dataUrl', () => {
    const files = buildLayer1ExportFiles(buildBundle());
    const fileNames = files.map((file) => file.fileName);

    expect(fileNames).not.toContain(SYSTEM_DESIGN_CONFIG.exportFiles.diagramPng);
    expect(fileNames).not.toContain(SYSTEM_DESIGN_CONFIG.exportFiles.diagramSvg);
  });

  it('includes a PNG diagram file with data-url encoding when a PNG image is present', () => {
    const files = buildLayer1ExportFiles(
      buildBundle({
        diagramImage: { format: 'png', dataUrl: 'data:image/png;base64,AAAA' },
      }),
    );
    const imageFile = files.find(
      (file) => file.fileName === SYSTEM_DESIGN_CONFIG.exportFiles.diagramPng,
    );

    expect(imageFile).toBeDefined();
    expect(imageFile?.encoding).toBe('data-url');
    expect(imageFile?.mimeType).toBe('image/png');
    expect(imageFile?.content).toBe('data:image/png;base64,AAAA');
  });

  it('includes an SVG diagram file when an SVG image is present', () => {
    const files = buildLayer1ExportFiles(
      buildBundle({
        diagramImage: { format: 'svg', dataUrl: 'data:image/svg+xml;base64,AAAA' },
      }),
    );
    const imageFile = files.find(
      (file) => file.fileName === SYSTEM_DESIGN_CONFIG.exportFiles.diagramSvg,
    );

    expect(imageFile).toBeDefined();
    expect(imageFile?.mimeType).toBe('image/svg+xml');
  });

  it('prefers a custom diagramImage.fileName over the default export file name', () => {
    const files = buildLayer1ExportFiles(
      buildBundle({
        diagramImage: {
          format: 'png',
          dataUrl: 'data:image/png;base64,AAAA',
          fileName: 'custom-diagram.png',
        },
      }),
    );

    expect(files.some((file) => file.fileName === 'custom-diagram.png')).toBe(true);
  });
});

describe('getLayer1ExportSummary', () => {
  it('reports fileCount, fileNames, approvedAt, and includesDiagramImage', () => {
    const bundle = buildBundle({
      diagramImage: { format: 'png', dataUrl: 'data:image/png;base64,AAAA' },
    });
    const summary = getLayer1ExportSummary(bundle);

    expect(summary.fileCount).toBe(3);
    expect(summary.fileNames).toEqual(
      expect.arrayContaining([
        SYSTEM_DESIGN_CONFIG.exportFiles.markdownSpec,
        SYSTEM_DESIGN_CONFIG.exportFiles.drawioXml,
        SYSTEM_DESIGN_CONFIG.exportFiles.diagramPng,
      ]),
    );
    expect(summary.approvedAt).toBe(bundle.approvedAt);
    expect(summary.includesDiagramImage).toBe(true);
  });

  it('reports includesDiagramImage as false when there is no diagram image', () => {
    const summary = getLayer1ExportSummary(buildBundle());
    expect(summary.includesDiagramImage).toBe(false);
    expect(summary.fileCount).toBe(2);
  });
});
