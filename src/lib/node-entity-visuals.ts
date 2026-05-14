import type { Node } from '@/types/backend-dtos';

export type EntityVisualType = 'person' | 'place' | 'event' | 'topic' | 'action' | 'other';

export interface EntityVisualStyle {
  color: string;
  label: string;
}

export const ENTITY_VISUAL_STYLES: Record<EntityVisualType, EntityVisualStyle> = {
  person: { color: '#d94841', label: 'Person' },
  place: { color: '#3b82f6', label: 'Place' },
  event: { color: '#f59e0b', label: 'Event' },
  topic: { color: '#10b981', label: 'Topic' },
  action: { color: '#6366f1', label: 'Action' },
  other: { color: '#6b7280', label: 'Other' },
};

function normalizeEntityType(value: unknown): EntityVisualType {
  if (typeof value !== 'string') {
    return 'other';
  }

  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, '_');

  switch (normalized) {
    case 'person':
      return 'person';
    case 'place':
      return 'place';
    case 'event':
      return 'event';
    case 'topic':
      return 'topic';
    case 'action':
      return 'action';
    default:
      return 'other';
  }
}

function getEntityTypeFromNodeDetails(node: Node): EntityVisualType {
  const details = node.nodeDetails as Record<string, unknown> | undefined;

  if (!details) return 'other';

  const candidates = [
    details.entityType,
    details.entity_type,
    details.semanticType,
    details.semantic_type,
    details.category,
    details.type,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeEntityType(candidate);
    if (normalized !== 'other') {
      return normalized;
    }
  }

  return 'other';
}

export function getNodeEntityVisualType(node: Node): EntityVisualType {
  const fromDetails = getEntityTypeFromNodeDetails(node);
  if (fromDetails !== 'other') {
    return fromDetails;
  }

  // Keep a deterministic fallback for nodes without explicit semantic metadata.
  const fallback = node.nodeType.toString().toUpperCase();
  if (fallback === 'ASSUMPTION') return 'action';
  if (fallback === 'CONTEXT') return 'place';
  return 'topic';
}

export function getNodeEntityVisualStyle(node: Node): EntityVisualStyle {
  return ENTITY_VISUAL_STYLES[getNodeEntityVisualType(node)] ?? ENTITY_VISUAL_STYLES.other;
}
