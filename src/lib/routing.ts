import { NodeType } from '@/types/backend-dtos';

export function getNodeRoute(
  spaceSlug: string,
  node: { nodeType: string; slug?: string | null; id: string },
  options?: { fromContext?: string }
): string {
  if (node.nodeType === NodeType.CONTEXT && node.slug) {
    return `/spaces/${spaceSlug}/context/${node.slug}`;
  }
  const base = `/spaces/${spaceSlug}/node/${node.id}`;
  if (options?.fromContext) {
    return `${base}?fromContext=${encodeURIComponent(options.fromContext)}`;
  }
  return base;
}
