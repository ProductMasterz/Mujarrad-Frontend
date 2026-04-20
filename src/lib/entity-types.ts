import type { Node } from '@/types/backend-dtos';

function parseNodeDetails(node?: Node | null): Record<string, unknown> | undefined {
  const details = node?.nodeDetails;

  if (!details) return undefined;

  if (typeof details === 'string') {
    try {
      return JSON.parse(details) as Record<string, unknown>;
    } catch {
      return undefined;
    }
  }

  if (typeof details === 'object') {
    return details as Record<string, unknown>;
  }

  return undefined;
}

export function normalizeEntityType(value?: unknown): string {
  if (typeof value !== 'string') return 'unknown';

  const cleaned = value.trim();

  return cleaned
    ? cleaned.toLowerCase().replace(/\s+/g, '_')
    : 'unknown';
}

export function getNodeEntityType(node?: Node | null): string {
  const details = parseNodeDetails(node);

  const raw =
    details?.entityType ||
    details?.entity_type ||
    details?.semanticType ||
    details?.type ||
    details?.label;

  return normalizeEntityType(raw);
}

export function withUpdatedEntityType(
  nodeDetails: Record<string, unknown> | string | undefined,
  entityType: string
): Record<string, unknown> {
  let parsedDetails: Record<string, unknown> = {};

  if (typeof nodeDetails === 'string') {
    try {
      parsedDetails = JSON.parse(nodeDetails) as Record<string, unknown>;
    } catch {
      parsedDetails = {};
    }
  } else if (nodeDetails && typeof nodeDetails === 'object') {
    parsedDetails = nodeDetails;
  }

  const normalized = normalizeEntityType(entityType);

  return {
    ...parsedDetails,
    entityType: normalized,
    semanticType: normalized,
  };
}
