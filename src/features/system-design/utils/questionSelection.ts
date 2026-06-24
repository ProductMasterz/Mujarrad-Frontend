import type { ConstructiveQuestion } from '../types/layer1.types';

export function selectNextQuestion(questions: ConstructiveQuestion[]): ConstructiveQuestion | null {
  // If we had multiple generated, we'd pick the best one.
  // Since we ask the AI for exactly one, we just return the first one or null.
  return questions.length > 0 ? questions[0] : null;
}
