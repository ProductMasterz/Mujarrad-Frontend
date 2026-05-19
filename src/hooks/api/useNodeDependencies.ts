/**
 * useNodeDependencies Hook
 *
 * Fetches node dependencies (children and referencing nodes) before deletion
 * to show warnings and handle cascade/orphan options.
 */

import { useQuery } from '@tanstack/react-query';
import { nodeService } from '@/services/api/node.service';
import { attributeService } from '@/services/api/attribute.service';
import type { Node, Attribute } from '@/types/backend-dtos';

export interface NodeDependencies {
  children: Node[];
  references: Attribute[];
  hasChildren: boolean;
  hasReferences: boolean;
  hasDependencies: boolean;
  childCount: number;
  referenceCount: number;
}

/**
 * Query key factory for node dependencies
 */
export const nodeDependencyKeys = {
  all: ['nodeDependencies'] as const,
  dependencies: (spaceSlug: string, nodeId: string) =>
    [...nodeDependencyKeys.all, spaceSlug, nodeId] as const,
};

/**
 * Hook to fetch node dependencies (children and references)
 *
 * @param spaceSlug - Space slug
 * @param nodeId - Node ID to check dependencies for
 * @param enabled - Whether to enable the query (default: false, enable when needed)
 */
export const useNodeDependencies = (
  spaceSlug: string,
  nodeId: string,
  enabled: boolean = false
) => {
  return useQuery({
    queryKey: nodeDependencyKeys.dependencies(spaceSlug, nodeId),
    queryFn: async (): Promise<NodeDependencies> => {
      // Fetch children (nodes where this node is parent via 'contains' relationship)
      // We need to get all nodes and filter those whose parent contains this nodeId
      const allNodes = await nodeService.getNodes(spaceSlug);

      // Get attributes where this node is the source with 'contains' type
      const nodeAttributes = await attributeService.getNodeAttributes(nodeId, {
        attributeType: 'contains',
      });

      // Children are nodes that this node contains (outgoing 'contains' relationships)
      const childNodeIds = nodeAttributes.map((attr) => attr.targetNodeId);
      const children = allNodes.filter((node) => childNodeIds.includes(node.id));

      // Get incoming references (other nodes that reference this node)
      // We need to check all attributes in the space that target this node
      const spaceAttributes = await attributeService.getSpaceAttributes(spaceSlug);

      // References are attributes where this node is the target (incoming edges)
      // Exclude 'contains' relationships (those are parent-child, not references)
      const references = spaceAttributes.filter(
        (attr) =>
          attr.targetNodeId === nodeId &&
          attr.attributeType !== 'contains' &&
          attr.sourceNodeId !== nodeId // Exclude self-references
      );

      return {
        children,
        references,
        hasChildren: children.length > 0,
        hasReferences: references.length > 0,
        hasDependencies: children.length > 0 || references.length > 0,
        childCount: children.length,
        referenceCount: references.length,
      };
    },
    enabled: enabled && !!spaceSlug && !!nodeId,
    staleTime: 30000, // Cache for 30 seconds
  });
};

/**
 * Get all descendant nodes (recursive children)
 * Useful for cascade delete operations
 */
export const useNodeDescendants = (
  spaceSlug: string,
  nodeId: string,
  enabled: boolean = false
) => {
  return useQuery({
    queryKey: [...nodeDependencyKeys.dependencies(spaceSlug, nodeId), 'descendants'],
    queryFn: async (): Promise<Node[]> => {
      const allNodes = await nodeService.getNodes(spaceSlug);
      const spaceAttributes = await attributeService.getSpaceAttributes(spaceSlug);

      // Build a map of parent -> children using 'contains' relationships
      const childrenMap = new Map<string, string[]>();
      spaceAttributes
        .filter((attr) => attr.attributeType === 'contains')
        .forEach((attr) => {
          const existing = childrenMap.get(attr.sourceNodeId) || [];
          existing.push(attr.targetNodeId);
          childrenMap.set(attr.sourceNodeId, existing);
        });

      // Recursively collect all descendants
      const descendants: Node[] = [];
      const visited = new Set<string>();

      const collectDescendants = (parentId: string) => {
        if (visited.has(parentId)) return; // Prevent cycles
        visited.add(parentId);

        const childIds = childrenMap.get(parentId) || [];
        for (const childId of childIds) {
          const childNode = allNodes.find((n) => n.id === childId);
          if (childNode && !descendants.some((d) => d.id === childId)) {
            descendants.push(childNode);
            collectDescendants(childId); // Recurse
          }
        }
      };

      collectDescendants(nodeId);
      return descendants;
    },
    enabled: enabled && !!spaceSlug && !!nodeId,
    staleTime: 30000,
  });
};
