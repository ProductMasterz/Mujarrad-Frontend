import { describe, expect, it } from '@jest/globals';

import type { CompletenessReport } from '../../types/layer1.types';
import { isReadyForDiagram } from '../completeness';

function buildCompletenessReport(overrides: Partial<CompletenessReport> = {}): CompletenessReport {
  return {
    overallScore: 80,
    readyForSpec: true,
    readyForDiagram: true,
    categories: [],
    missingCriticalItems: [],
    weakItems: [],
    ...overrides,
  };
}

describe('isReadyForDiagram', () => {
  it('returns false when completeness is null', () => {
    expect(isReadyForDiagram(null)).toBe(false);
  });

  it('returns true when readyForDiagram is true', () => {
    expect(isReadyForDiagram(buildCompletenessReport({ readyForDiagram: true }))).toBe(true);
  });

  it('returns false when readyForDiagram is false', () => {
    expect(isReadyForDiagram(buildCompletenessReport({ readyForDiagram: false }))).toBe(false);
  });
});
