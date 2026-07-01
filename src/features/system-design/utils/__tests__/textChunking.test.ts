import { describe, expect, it } from '@jest/globals';

import { shouldChunkText, splitTextIntoChunks } from '../textChunking';

describe('shouldChunkText', () => {
  it('returns false when text is at or under the limit', () => {
    expect(shouldChunkText('a'.repeat(100), 100)).toBe(false);
    expect(shouldChunkText('a'.repeat(50), 100)).toBe(false);
  });

  it('returns true when text exceeds the limit', () => {
    expect(shouldChunkText('a'.repeat(101), 100)).toBe(true);
  });
});

describe('splitTextIntoChunks', () => {
  it('returns an empty array for empty text', () => {
    expect(
      splitTextIntoChunks('', { maxChunkCharacters: 100, chunkOverlapCharacters: 10 }),
    ).toEqual([]);
  });

  it('returns a single chunk when text fits within maxChunkCharacters', () => {
    const text = 'a short piece of text';
    const chunks = splitTextIntoChunks(text, {
      maxChunkCharacters: 100,
      chunkOverlapCharacters: 10,
    });

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toMatchObject({
      index: 0,
      text,
      characterStart: 0,
      characterEnd: text.length,
    });
    expect(chunks[0].id).toEqual(expect.any(String));
  });

  it('splits long text into multiple overlapping chunks', () => {
    const text = 'a'.repeat(250);
    const chunks = splitTextIntoChunks(text, {
      maxChunkCharacters: 100,
      chunkOverlapCharacters: 20,
    });

    expect(chunks.length).toBeGreaterThan(1);

    chunks.forEach((chunk, index) => {
      expect(chunk.index).toBe(index);
      expect(chunk.text.length).toBeLessThanOrEqual(100);
      expect(chunk.text).toBe(text.slice(chunk.characterStart, chunk.characterEnd));
    });

    // The last chunk must reach the end of the source text.
    expect(chunks[chunks.length - 1].characterEnd).toBe(text.length);
  });

  it('produces overlap between consecutive chunks', () => {
    const text = 'a'.repeat(250);
    const chunks = splitTextIntoChunks(text, {
      maxChunkCharacters: 100,
      chunkOverlapCharacters: 20,
    });

    for (let i = 1; i < chunks.length; i += 1) {
      const previous = chunks[i - 1];
      const current = chunks[i];
      expect(current.characterStart).toBeLessThan(previous.characterEnd);
    }
  });

  it('always makes forward progress even with large overlap values', () => {
    const text = 'a'.repeat(50);
    const chunks = splitTextIntoChunks(text, {
      maxChunkCharacters: 10,
      chunkOverlapCharacters: 9999,
    });

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[chunks.length - 1].characterEnd).toBe(text.length);
  });
});
