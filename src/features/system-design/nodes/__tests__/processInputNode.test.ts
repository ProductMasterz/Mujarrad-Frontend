import { describe, expect, it } from '@jest/globals';

import { processInputNode } from '../processInputNode';
import type { RawInputPayload } from '../../types/input.types';

function buildRawInput(overrides: Partial<RawInputPayload> = {}): RawInputPayload {
  return {
    id: 'raw-input-1',
    sourceType: 'typed_text',
    rawText: 'A system that lets customers place and track orders online.',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('processInputNode', () => {
  it('returns a ready processingResult for valid, non-empty input', async () => {
    const { processingResult } = await processInputNode({ rawInput: buildRawInput() });

    expect(processingResult.status).toBe('ready');
    expect(processingResult.processedInput).not.toBeNull();
    expect(processingResult.processedInput?.normalizedText).toContain(
      'A system that lets customers place and track orders online.',
    );
    expect(processingResult.errors).toEqual([]);
  });

  it('marks the result as failed for empty input text', async () => {
    const { processingResult } = await processInputNode({
      rawInput: buildRawInput({ rawText: '   ' }),
    });

    expect(processingResult.status).toBe('failed');
    expect(processingResult.processedInput).toBeNull();
    expect(processingResult.errors).not.toEqual([]);
  });

  it('preserves the original rawInput on the result', async () => {
    const rawInput = buildRawInput({ id: 'custom-id' });
    const { processingResult } = await processInputNode({ rawInput });

    expect(processingResult.rawInput).toEqual(rawInput);
  });

  it('surfaces a short_input warning for very short but non-empty text', async () => {
    const { processingResult } = await processInputNode({
      rawInput: buildRawInput({ rawText: 'too short' }),
    });

    expect(processingResult.warnings.some((warning) => warning.code === 'short_input')).toBe(
      true,
    );
  });
});
