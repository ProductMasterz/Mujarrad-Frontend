import type { Layer1GraphState } from '../types/graph.types';
import type {
  Layer1ArtifactBundle,
  Layer1ArtifactManifest,
} from '../types/layer1.types';
import { buildLayer1CanonicalArtifact } from './finalArtifactBuilder';
import {
  toCompactJson,
  toMarkdown,
  toPlainText,
  toPrettyJson,
  toToon,
  toYaml,
} from './finalArtifactFormatters';
import { createIsoTimestamp } from './id';
import { buildTokenEfficiencyReport } from './tokenEfficiency';

function utf8Bytes(value: string): number {
  return new TextEncoder().encode(value).length;
}

export function buildLayer1ArtifactBundle(
  state: Layer1GraphState,
): Layer1ArtifactBundle {
  const canonical = buildLayer1CanonicalArtifact(state);

  const markdownSpec = toMarkdown(canonical);
  const jsonSpec = toPrettyJson(canonical);
  const compactJsonSpec = toCompactJson(canonical);
  const toonSpec = toToon(canonical);
  const yamlSpec = toYaml(canonical);
  const plainTextSpec = toPlainText(canonical);

  const tokenEfficiencyReport = buildTokenEfficiencyReport([
    { format: 'toon', content: toonSpec },
    { format: 'compact_json', content: compactJsonSpec },
    { format: 'json', content: jsonSpec },
    { format: 'yaml', content: yamlSpec },
  ]);

  const approvedAt = createIsoTimestamp();

  const manifest: Layer1ArtifactManifest = {
    version: '1.0',
    createdAt: approvedAt,
    entries: [
      {
        id: 'markdown',
        format: 'markdown',
        mediaType: 'text/markdown',
        fileName: 'final-system-spec.md',
        available: true,
        characterCount: markdownSpec.length,
        utf8Bytes: utf8Bytes(markdownSpec),
      },
      {
        id: 'json',
        format: 'json',
        mediaType: 'application/json',
        fileName: 'final-system-spec.json',
        available: true,
        characterCount: jsonSpec.length,
        utf8Bytes: utf8Bytes(jsonSpec),
      },
      {
        id: 'compact-json',
        format: 'compact_json',
        mediaType: 'application/json',
        fileName: 'final-system-spec.compact.json',
        available: true,
        characterCount: compactJsonSpec.length,
        utf8Bytes: utf8Bytes(compactJsonSpec),
      },
      {
        id: 'toon',
        format: 'toon',
        mediaType: 'text/plain',
        fileName: 'final-system-spec.toon',
        available: true,
        characterCount: toonSpec.length,
        utf8Bytes: utf8Bytes(toonSpec),
      },
      {
        id: 'yaml',
        format: 'yaml',
        mediaType: 'application/yaml',
        fileName: 'final-system-spec.yaml',
        available: true,
        characterCount: yamlSpec.length,
        utf8Bytes: utf8Bytes(yamlSpec),
      },
      {
        id: 'plain-text',
        format: 'plain_text',
        mediaType: 'text/plain',
        fileName: 'final-system-spec.txt',
        available: true,
        characterCount: plainTextSpec.length,
        utf8Bytes: utf8Bytes(plainTextSpec),
      },
      {
        id: 'drawio',
        format: 'drawio_xml',
        mediaType: 'application/xml',
        fileName: 'final-system-diagram.drawio',
        available: true,
        characterCount: state.drawioXml.length,
        utf8Bytes: utf8Bytes(state.drawioXml),
      },
      {
        id: 'mermaid',
        format: 'mermaid',
        mediaType: 'text/plain',
        fileName: 'final-system-diagram.mmd',
        available: Boolean(
          state.mermaidSource,
        ),
        characterCount:
          state.mermaidSource.length,
        utf8Bytes:
          utf8Bytes(
            state.mermaidSource,
          ),
      },
      {
        id: 'svg',
        format: 'svg',
        mediaType: 'image/svg+xml',
        fileName: 'final-system-diagram.svg',
        available: Boolean(
          state.diagramImages?.svg?.dataUrl,
        ),
      },
      {
        id: 'png',
        format: 'png',
        mediaType: 'image/png',
        fileName: 'final-system-diagram.png',
        available: Boolean(
          state.diagramImages?.png?.dataUrl,
        ),
      },
      {
        id: 'token-report',
        format: 'token_report',
        mediaType: 'application/json',
        fileName: 'layer2-token-efficiency-report.json',
        available: true,
      },
    ],
  };

  return {
    canonical,

    markdownSpec,
    jsonSpec,
    compactJsonSpec,
    toonSpec,
    yamlSpec,
    plainTextSpec,

    drawioXml:
      state.drawioXml,

    mermaidSource:
      state.mermaidSource,

    selectedDiagramRenderer:
      state.selectedDiagramRenderer ??
      state.activeDiagramRenderer,

    diagramImages: {
      svg: state.diagramImages?.svg,
      png: state.diagramImages?.png,
    },

    diagramSummary: state.diagramSummary,

    tokenEfficiencyReport,
    manifest,

    approvedAt,
  };
}
