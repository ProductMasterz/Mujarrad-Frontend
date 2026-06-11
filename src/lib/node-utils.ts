import type { Node } from '@/types/backend-dtos';

export function parseNodeDetails(node?: Node | null): Record<string, unknown> {
  if (!node?.nodeDetails) return {};

  if (typeof node.nodeDetails === 'string') {
    try {
      const parsed = JSON.parse(node.nodeDetails);
      return parsed && typeof parsed === 'object'
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }

  return node.nodeDetails as Record<string, unknown>;
}

export function isAiCreatedNode(node?: Node | null): boolean {
  const details = parseNodeDetails(node);

  const createdFrom = String(details.createdFrom || '').toLowerCase();
  const generatedBy = String(details.generatedBy || '').toLowerCase();
  const source = String(details.source || '').toLowerCase();
  const chatNodeType = String(details.chatNodeType || '').toLowerCase();
  const semanticTypeSource = String(details.semanticTypeSource || '').toLowerCase();

  return (
    createdFrom === 'agent' ||
    generatedBy === 'agent' ||
    source === 'agent' ||
    chatNodeType === 'entity' ||
    semanticTypeSource === 'agent'
  );
}

export function getSemanticTypeFromNode(
  node?: Node | null,
  fallbackEntityType?: string,
): string {
  const details = parseNodeDetails(node);

  const value =
    fallbackEntityType ||
    node?.semanticType ||
    node?.entityType ||
    details.semanticType ||
    details.entityType ||
    details.nodeType ||
    '';

  const normalized = String(value || '').toLowerCase().trim();

  if (!normalized || normalized === 'regular' || normalized === 'unknown') {
    return 'unknown';
  }

  return normalized;
}
