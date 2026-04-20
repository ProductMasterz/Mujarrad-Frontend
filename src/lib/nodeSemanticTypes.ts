import type { Node, NodeDetails } from '@/types/backend-dtos';
import { getNodeEntityType, withUpdatedEntityType } from '@/lib/entity-types';

export const DEFAULT_SEMANTIC_TYPE = 'Unclassified';

export function normalizeSemanticType(value?: unknown): string {
  if (typeof value !== 'string') return DEFAULT_SEMANTIC_TYPE;

  const cleaned = value.trim();

  if (!cleaned) return DEFAULT_SEMANTIC_TYPE;

  return cleaned;
}

export function getNodeSemanticType(node: Node): string {
  const entityType = getNodeEntityType(node);

  if (!entityType || entityType === 'unknown') {
    return DEFAULT_SEMANTIC_TYPE;
  }

  return entityType;
}

export function getNodeSemanticTypeKey(value?: unknown): string {
  return normalizeSemanticType(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_');
}

export function buildNodeDetailsWithSemanticType(
  currentDetails: NodeDetails | Record<string, unknown> | undefined,
  semanticType: string,
  source: 'agent' | 'manual' | 'system'
): Record<string, unknown> {
  return {
    ...withUpdatedEntityType(currentDetails, semanticType),
    semanticTypeSource: source,
  };
}