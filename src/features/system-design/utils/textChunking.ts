import type { TextChunk } from '../types/input.types';
import { createSystemDesignId } from './id';

interface SplitTextIntoChunksOptions {
  maxChunkCharacters: number;
  chunkOverlapCharacters: number;
}

export function splitTextIntoChunks(
  text: string,
  options: SplitTextIntoChunksOptions,
): TextChunk[] {
  const { maxChunkCharacters, chunkOverlapCharacters } = options;

  if (!text) {
    return [];
  }

  if (text.length <= maxChunkCharacters) {
    return [
      {
        id: createSystemDesignId('chunk'),
        index: 0,
        text,
        characterStart: 0,
        characterEnd: text.length,
      },
    ];
  }

  const chunks: TextChunk[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + maxChunkCharacters, text.length);
    const chunkText = text.slice(start, end);

    chunks.push({
      id: createSystemDesignId('chunk'),
      index: chunks.length,
      text: chunkText,
      characterStart: start,
      characterEnd: end,
    });

    if (end >= text.length) {
      break;
    }

    start = Math.max(end - chunkOverlapCharacters, start + 1);
  }

  return chunks;
}

export function shouldChunkText(
  text: string,
  maxDirectCharacters: number,
): boolean {
  return text.length > maxDirectCharacters;
}
