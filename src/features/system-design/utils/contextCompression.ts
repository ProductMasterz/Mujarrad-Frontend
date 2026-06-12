import type { TextChunk } from '../types/input.types';

export function createDeterministicInputSummary(
  normalizedText: string,
  chunks: TextChunk[],
): string {
  if (!normalizedText) {
    return '';
  }

  if (chunks.length <= 1) {
    return normalizedText;
  }

  const firstChunkPreview = chunks[0]?.text.slice(0, 800).trim() ?? '';
  const lastChunkPreview = chunks[chunks.length - 1]?.text.slice(0, 800).trim() ?? '';

  return [
    `Large input split into ${chunks.length} chunks.`,
    '',
    'Beginning preview:',
    firstChunkPreview,
    '',
    'Ending preview:',
    lastChunkPreview,
  ].join('\n');
}
