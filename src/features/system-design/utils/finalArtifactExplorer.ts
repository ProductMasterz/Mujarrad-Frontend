import type {
  Layer1ArtifactBundle,
  Layer1TextArtifactFormat,
  Layer1TokenEfficiencyEntry,
} from '../types/layer1.types';

export type FinalArtifactId =
  | 'markdown'
  | 'json'
  | 'compact_json'
  | 'toon'
  | 'yaml'
  | 'plain_text'
  | 'drawio_xml'
  | 'mermaid'
  | 'svg'
  | 'png'
  | 'manifest'
  | 'token_report';

export type FinalArtifactPreviewKind =
  | 'text'
  | 'image'
  | 'json';

export interface FinalArtifactExplorerItem {
  id: FinalArtifactId;
  label: string;
  description: string;
  fileName: string;
  mediaType: string;
  previewKind: FinalArtifactPreviewKind;
  content?: string;
  dataUrl?: string;
  available: boolean;
  tokenEntry?: Layer1TokenEfficiencyEntry;
  layer2StructuredFormat?: Layer1TextArtifactFormat;
}

function findTokenEntry(
  bundle: Layer1ArtifactBundle,
  format: Layer1TextArtifactFormat,
): Layer1TokenEfficiencyEntry | undefined {
  return bundle.tokenEfficiencyReport.entries.find(
    (entry) => entry.format === format,
  );
}

export function buildFinalArtifactExplorerItems(
  bundle: Layer1ArtifactBundle,
): FinalArtifactExplorerItem[] {
  return [
    {
      id: 'markdown',
      label: 'Markdown',
      description: 'Human-readable final system specification.',
      fileName: 'final-system-spec.md',
      mediaType: 'text/markdown',
      previewKind: 'text',
      content: bundle.markdownSpec,
      available: Boolean(bundle.markdownSpec),
    },
    {
      id: 'json',
      label: 'Pretty JSON',
      description:
        'Readable structured representation of the canonical Layer 1 artifact.',
      fileName: 'final-system-spec.json',
      mediaType: 'application/json',
      previewKind: 'json',
      content: bundle.jsonSpec,
      available: Boolean(bundle.jsonSpec),
      tokenEntry: findTokenEntry(bundle, 'json'),
      layer2StructuredFormat: 'json',
    },
    {
      id: 'compact_json',
      label: 'Compact JSON',
      description:
        'Whitespace-minimized structured representation for lower transport cost.',
      fileName: 'final-system-spec.compact.json',
      mediaType: 'application/json',
      previewKind: 'json',
      content: bundle.compactJsonSpec,
      available: Boolean(bundle.compactJsonSpec),
      tokenEntry: findTokenEntry(bundle, 'compact_json'),
      layer2StructuredFormat: 'compact_json',
    },
    {
      id: 'toon',
      label: 'TOON',
      description:
        'Token-oriented structured representation generated from the same canonical object.',
      fileName: 'final-system-spec.toon',
      mediaType: 'text/plain',
      previewKind: 'text',
      content: bundle.toonSpec,
      available: Boolean(bundle.toonSpec),
      tokenEntry: findTokenEntry(bundle, 'toon'),
      layer2StructuredFormat: 'toon',
    },
    {
      id: 'yaml',
      label: 'YAML',
      description:
        'Human-readable structured representation of the canonical object.',
      fileName: 'final-system-spec.yaml',
      mediaType: 'application/yaml',
      previewKind: 'text',
      content: bundle.yamlSpec,
      available: Boolean(bundle.yamlSpec),
      tokenEntry: findTokenEntry(bundle, 'yaml'),
      layer2StructuredFormat: 'yaml',
    },
    {
      id: 'plain_text',
      label: 'Plain Text',
      description: 'Compact human-readable system summary.',
      fileName: 'final-system-spec.txt',
      mediaType: 'text/plain',
      previewKind: 'text',
      content: bundle.plainTextSpec,
      available: Boolean(bundle.plainTextSpec),
    },
    {
      id: 'drawio_xml',
      label: 'Draw.io XML',
      description:
        bundle.selectedDiagramRenderer ===
        'drawio'
          ? 'Official approved editable Draw.io diagram source.'
          : 'Alternative Draw.io source generated from the same semantic model.',
      fileName: 'final-system-diagram.drawio',
      mediaType: 'application/xml',
      previewKind: 'text',
      content: bundle.drawioXml,
      available: Boolean(bundle.drawioXml),
    },
    {
      id: 'mermaid',
      label: 'Mermaid Source',
      description:
        bundle.selectedDiagramRenderer ===
        'mermaid'
          ? 'Official approved Mermaid diagram source.'
          : 'Alternative Mermaid representation generated from the same semantic model.',
      fileName:
        'final-system-diagram.mmd',
      mediaType:
        'text/plain',
      previewKind:
        'text',
      content:
        bundle.mermaidSource,
      available:
        Boolean(
          bundle.mermaidSource,
        ),
    },
    {
      id: 'svg',
      label: 'SVG Diagram',
      description: 'Scalable visual representation of the approved diagram.',
      fileName:
        bundle.diagramImages.svg?.fileName ??
        'final-system-diagram.svg',
      mediaType: 'image/svg+xml',
      previewKind: 'image',
      dataUrl: bundle.diagramImages.svg?.dataUrl,
      available: Boolean(bundle.diagramImages.svg?.dataUrl),
    },
    {
      id: 'png',
      label: 'PNG Diagram',
      description: 'Raster image representation of the approved diagram.',
      fileName:
        bundle.diagramImages.png?.fileName ??
        'final-system-diagram.png',
      mediaType: 'image/png',
      previewKind: 'image',
      dataUrl: bundle.diagramImages.png?.dataUrl,
      available: Boolean(bundle.diagramImages.png?.dataUrl),
    },
    {
      id: 'manifest',
      label: 'Artifact Manifest',
      description:
        'Inventory of every generated Layer 1 artifact and its availability.',
      fileName: 'artifact-manifest.json',
      mediaType: 'application/json',
      previewKind: 'json',
      content: JSON.stringify(bundle.manifest, null, 2),
      available: true,
    },
    {
      id: 'token_report',
      label: 'Token Report',
      description:
        'Structured token-efficiency comparison for Layer 2 transport.',
      fileName: 'layer2-token-efficiency-report.json',
      mediaType: 'application/json',
      previewKind: 'json',
      content: JSON.stringify(
        bundle.tokenEfficiencyReport,
        null,
        2,
      ),
      available: true,
    },
  ];
}
