import { describe, expect, it } from '@jest/globals';

import {
  estimateTokenCount,
  getInputSizeLabel,
  normalizeSystemDesignInput,
} from '../inputNormalization';

describe('normalizeSystemDesignInput', () => {
  it('converts Windows line endings to \\n', () => {
    expect(normalizeSystemDesignInput('line one\r\nline two')).toBe('line one\nline two');
  });

  it('converts lone carriage returns to \\n', () => {
    expect(normalizeSystemDesignInput('line one\rline two')).toBe('line one\nline two');
  });

  it('strips trailing whitespace before newlines', () => {
    expect(normalizeSystemDesignInput('line one   \nline two\t\n')).toBe('line one\nline two');
  });

  it('collapses runs of 4+ blank lines down to two blank lines', () => {
    const input = 'first\n\n\n\n\nsecond';
    expect(normalizeSystemDesignInput(input)).toBe('first\n\n\nsecond');
  });

  it('trims leading and trailing whitespace', () => {
    expect(normalizeSystemDesignInput('   hello world   ')).toBe('hello world');
  });

  it('returns an empty string for whitespace-only input', () => {
    expect(normalizeSystemDesignInput('   \n\n  ')).toBe('');
  });
});

describe('estimateTokenCount', () => {
  it('returns 0 for empty or whitespace-only text', () => {
    expect(estimateTokenCount('')).toBe(0);
    expect(estimateTokenCount('   ')).toBe(0);
  });

  it('estimates roughly 1 token per 4 characters, rounded up', () => {
    expect(estimateTokenCount('abcd')).toBe(1);
    expect(estimateTokenCount('abcde')).toBe(2);
    expect(estimateTokenCount('a'.repeat(100))).toBe(25);
  });
});

describe('getInputSizeLabel', () => {
  it('labels 0 characters as Empty', () => {
    expect(getInputSizeLabel(0)).toBe('Empty');
  });

  it('labels under 500 characters as Small', () => {
    expect(getInputSizeLabel(1)).toBe('Small');
    expect(getInputSizeLabel(499)).toBe('Small');
  });

  it('labels under 4000 characters as Medium', () => {
    expect(getInputSizeLabel(500)).toBe('Medium');
    expect(getInputSizeLabel(3999)).toBe('Medium');
  });

  it('labels under 12000 characters as Large', () => {
    expect(getInputSizeLabel(4000)).toBe('Large');
    expect(getInputSizeLabel(11999)).toBe('Large');
  });

  it('labels 12000+ characters as Very large', () => {
    expect(getInputSizeLabel(12000)).toBe('Very large');
    expect(getInputSizeLabel(50000)).toBe('Very large');
  });
});
