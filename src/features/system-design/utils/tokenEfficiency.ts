import type {
  Layer1TextArtifactFormat,
  Layer1TokenEfficiencyReport,
} from '../types/layer1.types';
import { createIsoTimestamp } from './id';

interface TextCandidate {
  format: Layer1TextArtifactFormat;
  content: string;
}

function utf8Bytes(value: string): number {
  return new TextEncoder().encode(value).length;
}

function estimateTokens(value: string): number {
  if (!value) {
    return 0;
  }

  return Math.ceil(value.length / 4);
}

export function buildTokenEfficiencyReport(
  candidates: TextCandidate[],
): Layer1TokenEfficiencyReport {
  const measured = candidates.map((candidate) => ({
    format: candidate.format,
    characterCount: candidate.content.length,
    utf8Bytes: utf8Bytes(candidate.content),
    estimatedTokens: estimateTokens(candidate.content),
  }));

  const sorted = [...measured].sort(
    (a, b) => a.estimatedTokens - b.estimatedTokens,
  );

  const highestTokens = Math.max(
    ...sorted.map((item) => item.estimatedTokens),
    1,
  );

  const entries = sorted.map((item, index) => ({
    ...item,
    relativeSavingsPercent:
      Math.round(
        (1 - item.estimatedTokens / highestTokens) * 10000,
      ) / 100,
    rank: index + 1,
  }));

  const lowest = entries[0];

  if (!lowest) {
    throw new Error(
      'Token efficiency report requires at least one candidate.',
    );
  }

  return {
    method: 'character_estimate',
    estimateFormula:
      'estimatedTokens = ceil(characterCount / 4)',
    comparedAt: createIsoTimestamp(),
    lowestTokenFormat: lowest.format,
    recommendedLayer2Format: lowest.format,
    entries,
    notes: [
      'Token counts are estimates, not exact model-tokenizer measurements.',
      'The ranking compares TOON, compact JSON, pretty JSON, and YAML generated from the same canonical object.',
      'Markdown and plain text are generated as human-readable artifacts but excluded from the structured Layer 2 transport ranking.',
      'Mermaid source, SVG, and PNG are separate diagram artifacts and excluded from the text transport ranking.',
      'Exact tokenizer-specific measurements should be added when the Layer 2 model is selected.',
    ],
  };
}
