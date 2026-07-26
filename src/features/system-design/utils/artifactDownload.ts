import JSZip from 'jszip';

import type { Layer1ArtifactBundle } from '../types/layer1.types';
import {
  buildFinalArtifactExplorerItems,
  type FinalArtifactExplorerItem,
} from './finalArtifactExplorer';

function triggerBlobDownload(
  blob: Blob,
  fileName: string,
): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = fileName;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

function dataUrlToBlob(dataUrl: string): Blob {
  const commaIndex = dataUrl.indexOf(',');

  if (commaIndex === -1) {
    throw new Error('Invalid diagram data URL.');
  }

  const header = dataUrl.slice(0, commaIndex);
  const payload = dataUrl.slice(commaIndex + 1);

  const mediaTypeMatch = header.match(
    /^data:([^;,]+)(;base64)?$/,
  );

  if (!mediaTypeMatch) {
    throw new Error('Unsupported diagram data URL.');
  }

  const mediaType = mediaTypeMatch[1];
  const isBase64 = Boolean(mediaTypeMatch[2]);

  if (isBase64) {
    const binary = atob(payload);
    const bytes = new Uint8Array(binary.length);

    for (
      let index = 0;
      index < binary.length;
      index += 1
    ) {
      bytes[index] = binary.charCodeAt(index);
    }

    return new Blob([bytes], {
      type: mediaType,
    });
  }

  return new Blob(
    [decodeURIComponent(payload)],
    {
      type: mediaType,
    },
  );
}

export function downloadFinalArtifact(
  item: FinalArtifactExplorerItem,
): void {
  if (!item.available) {
    throw new Error(
      `${item.label} is not available.`,
    );
  }

  if (item.dataUrl) {
    triggerBlobDownload(
      dataUrlToBlob(item.dataUrl),
      item.fileName,
    );

    return;
  }

  if (item.content === undefined) {
    throw new Error(
      `${item.label} has no downloadable content.`,
    );
  }

  triggerBlobDownload(
    new Blob([item.content], {
      type: `${item.mediaType};charset=utf-8`,
    }),
    item.fileName,
  );
}

export async function downloadLayer1ArtifactBundle(
  bundle: Layer1ArtifactBundle,
): Promise<void> {
  const zip = new JSZip();

  const root = zip.folder('mujarrad-layer1');

  if (!root) {
    throw new Error(
      'Could not create the Layer 1 ZIP bundle.',
    );
  }

  const specifications = root.folder('specifications');
  const diagram = root.folder('diagram');
  const reports = root.folder('reports');

  if (!specifications || !diagram || !reports) {
    throw new Error(
      'Could not create the Layer 1 ZIP folders.',
    );
  }

  specifications.file(
    'final-system-spec.md',
    bundle.markdownSpec,
  );

  specifications.file(
    'final-system-spec.json',
    bundle.jsonSpec,
  );

  specifications.file(
    'final-system-spec.compact.json',
    bundle.compactJsonSpec,
  );

  specifications.file(
    'final-system-spec.toon',
    bundle.toonSpec,
  );

  specifications.file(
    'final-system-spec.yaml',
    bundle.yamlSpec,
  );

  specifications.file(
    'final-system-spec.txt',
    bundle.plainTextSpec,
  );

  diagram.file(
    'final-system-diagram.drawio',
    bundle.drawioXml,
  );

  diagram.file(
    'final-system-diagram.mmd',
    bundle.mermaidSource,
  );

  diagram.file(
    'selected-renderer.json',
    JSON.stringify(
      {
        selectedDiagramRenderer:
          bundle.selectedDiagramRenderer,
      },
      null,
      2,
    ),
  );

  if (bundle.diagramImages.svg?.dataUrl) {
    diagram.file(
      bundle.diagramImages.svg.fileName,
      dataUrlToBlob(
        bundle.diagramImages.svg.dataUrl,
      ),
    );
  }

  if (bundle.diagramImages.png?.dataUrl) {
    diagram.file(
      bundle.diagramImages.png.fileName,
      dataUrlToBlob(
        bundle.diagramImages.png.dataUrl,
      ),
    );
  }

  reports.file(
    'artifact-manifest.json',
    JSON.stringify(
      bundle.manifest,
      null,
      2,
    ),
  );

  reports.file(
    'layer2-token-efficiency-report.json',
    JSON.stringify(
      bundle.tokenEfficiencyReport,
      null,
      2,
    ),
  );

  const artifactIndex =
    buildFinalArtifactExplorerItems(bundle).map(
      (item) => ({
        id: item.id,
        label: item.label,
        fileName: item.fileName,
        mediaType: item.mediaType,
        available: item.available,
      }),
    );

  root.file(
    'README.json',
    JSON.stringify(
      {
        runId: bundle.canonical.runId,
        generatedAt: bundle.approvedAt,
        selectedDiagramRenderer:
          bundle.selectedDiagramRenderer,
        recommendedLayer2Format:
          bundle.tokenEfficiencyReport
            .recommendedLayer2Format,
        artifacts: artifactIndex,
      },
      null,
      2,
    ),
  );

  const blob = await zip.generateAsync({
    type: 'blob',
  });

  triggerBlobDownload(
    blob,
    `mujarrad-layer1-${bundle.canonical.runId}.zip`,
  );
}
