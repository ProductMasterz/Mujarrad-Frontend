/**
 * Hook for building and managing hierarchy tree
 * Transforms nodes + attributes into tree structure with UI state
 */

import { useMemo } from 'react';
import type { Node, Attribute } from '@/types/backend-dtos';
import { HierarchyTree } from '@/types/hierarchy';
import { buildHierarchyTree } from '@/lib/hierarchy-utils';

interface UseHierarchyTreeParams {
  nodes: Node[];
  attributes: Attribute[];
  expandedNodeIds?: Set<string>;
  selectedNodeId?: string | null;
}

/**
 * Build hierarchy tree from nodes and attributes
 * Memoized to avoid expensive recalculations
 */
export function useHierarchyTree({
  nodes,
  attributes,
  expandedNodeIds = new Set(),
  selectedNodeId = null,
}: UseHierarchyTreeParams): HierarchyTree {
  return useMemo(() => {
    return buildHierarchyTree({
      nodes,
      attributes,
      expandedNodeIds,
      selectedNodeId,
    });
  }, [nodes, attributes, expandedNodeIds, selectedNodeId]);
}
