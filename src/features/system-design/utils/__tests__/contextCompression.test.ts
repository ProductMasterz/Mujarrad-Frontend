import { describe, expect, it } from '@jest/globals';

import { createDeterministicInputSummary } from '../contextCompression';
import { splitTextIntoChunks } from '../textChunking';

describe('createDeterministicInputSummary', () => {
  it('returns an empty string when normalizedText is empty', () => {
    expect(createDeterministicInputSummary('', [])).toBe('');
  });

  it('returns the full text when there is only one chunk', () => {
    const text = 'a short system description';
    const chunks = splitTextIntoChunks(text, {
      maxChunkCharacters: 1000,
      chunkOverlapCharacters: 100,
    });

    expect(createDeterministicInputSummary(text, chunks)).toBe(text);
  });

  it('builds a beginning/ending preview summary for multiple chunks', () => {
    const text = 'a'.repeat(50) + 'b'.repeat(50) + 'c'.repeat(50);
    const chunks = splitTextIntoChunks(text, {
      maxChunkCharacters: 50,
      chunkOverlapCharacters: 0,
    });

    const summary = createDeterministicInputSummary(text, chunks);

    expect(summary).toContain(`Large input split into ${chunks.length} chunks.`);
    expect(summary).toContain('Beginning preview:');
    expect(summary).toContain('Ending preview:');
    expect(summary).toContain('a'.repeat(50));
    expect(summary).toContain('c'.repeat(50));
  });

  it('truncates previews to at most 800 characters per side', () => {
    const chunkText = 'x'.repeat(2000);
    const chunks = [
      { id: '1', index: 0, text: chunkText, characterStart: 0, characterEnd: 2000 },
      { id: '2', index: 1, text: chunkText, characterStart: 2000, characterEnd: 4000 },
    ];

    const summary = createDeterministicInputSummary('anything-non-empty', chunks);
    const previewLine = summary.split('\n').find((line) => /^x+$/.test(line));

    expect(previewLine).toBeDefined();
    expect(previewLine!.length).toBeLessThanOrEqual(800);
  });
});
