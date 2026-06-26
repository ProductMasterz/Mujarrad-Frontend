import type { CompletenessReport } from '../types/layer1.types';

export function isReadyForDiagram(completeness: CompletenessReport | null): boolean {
  if (!completeness) return false;
  return completeness.readyForDiagram;
}
