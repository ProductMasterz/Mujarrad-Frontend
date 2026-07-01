import { describe, expect, it } from '@jest/globals';

import type { ConstructiveQuestion } from '../../types/layer1.types';
import { selectNextQuestion } from '../questionSelection';

function buildQuestion(overrides: Partial<ConstructiveQuestion> = {}): ConstructiveQuestion {
  return {
    id: 'q-1',
    question: 'Who are the primary users of this system?',
    category: 'users',
    reasonForAsking: 'Understanding the audience shapes the rest of the design.',
    basedOn: {},
    expectedAnswerType: 'short_text',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('selectNextQuestion', () => {
  it('returns null when there are no questions', () => {
    expect(selectNextQuestion([])).toBeNull();
  });

  it('returns the first question when there is exactly one', () => {
    const question = buildQuestion();
    expect(selectNextQuestion([question])).toEqual(question);
  });

  it('returns the first question when there are multiple candidates', () => {
    const first = buildQuestion({ id: 'q-1' });
    const second = buildQuestion({ id: 'q-2', category: 'workflow' });

    expect(selectNextQuestion([first, second])).toEqual(first);
  });
});
