import { SYSTEM_DESIGN_CONFIG } from '../config/systemDesignConfig';
import type { Layer1ArtifactBundle } from '../types/layer1.types';
import type { DownloadableFile } from './downloadFile';

/**
 * Returns true when a Layer 1 artifact bundle has the minimum content
 * required to be exported: an approved Markdown specification and a
 * Draw.io diagram.
 */
export function isLayer1BundleExportable(
  bundle: Layer1ArtifactBundle | null | undefined,
): bundle is Layer1ArtifactBundle {
  if (!bundle) {
    return false;
  }

  return bundle.markdownSpec.trim().length > 0 && bundle.drawioXml.trim().length > 0;
}

/**
 * Builds the list of downloadable files for an approved Layer 1 artifact
 * bundle, using the canonical file names from SYSTEM_DESIGN_CONFIG so the
 * exported file names stay consistent across the app.
 */
export function buildLayer1ExportFiles(bundle: Layer1ArtifactBundle): DownloadableFile[] {
  const files: DownloadableFile[] = [];
  const exportFileNames = SYSTEM_DESIGN_CONFIG.exportFiles;

  files.push({
    fileName: exportFileNames.markdownSpec,
    content: bundle.markdownSpec,
    mimeType: 'text/markdown;charset=utf-8',
    encoding: 'utf-8',
  });

  files.push({
    fileName: exportFileNames.drawioXml,
    content: bundle.drawioXml,
    mimeType: 'application/xml;charset=utf-8',
    encoding: 'utf-8',
  });

  if (bundle.diagramSummary && bundle.diagramSummary.trim().length > 0) {
    files.push({
      fileName: exportFileNames.diagramSummary,
      content: bundle.diagramSummary,
      mimeType: 'text/markdown;charset=utf-8',
      encoding: 'utf-8',
    });
  }

  if (bundle.diagramImage?.dataUrl) {
    const defaultFileName =
      bundle.diagramImage.format === 'svg' ? exportFileNames.diagramSvg : exportFileNames.diagramPng;

    files.push({
      fileName: bundle.diagramImage.fileName ?? defaultFileName,
      content: bundle.diagramImage.dataUrl,
      mimeType: bundle.diagramImage.format === 'svg' ? 'image/svg+xml' : 'image/png',
      encoding: 'data-url',
    });
  }

  return files;
}

export interface Layer1ExportSummary {
  fileCount: number;
  fileNames: string[];
  approvedAt: string;
  includesDiagramImage: boolean;
}

/**
 * Produces a small, serialisable summary of what an export would contain,
 * useful for displaying export readiness in the UI before a download is
 * actually triggered.
 */
export function getLayer1ExportSummary(bundle: Layer1ArtifactBundle): Layer1ExportSummary {
  const files = buildLayer1ExportFiles(bundle);

  return {
    fileCount: files.length,
    fileNames: files.map((file) => file.fileName),
    approvedAt: bundle.approvedAt,
    includesDiagramImage: Boolean(bundle.diagramImage?.dataUrl),
  };
}
