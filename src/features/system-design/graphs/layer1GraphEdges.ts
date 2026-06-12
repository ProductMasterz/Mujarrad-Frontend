import type { Layer1GraphNextAction } from '../types/graph.types';

export function shouldContinueLayer1Graph(
  nextAction: Layer1GraphNextAction,
): boolean {
  return nextAction !== 'complete' && nextAction !== 'error';
}
