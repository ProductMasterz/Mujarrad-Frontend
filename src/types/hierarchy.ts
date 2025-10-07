/**
 * Hierarchy types for tree navigation
 * Used to display hierarchical page structure
 */

import type { Node } from './backend-dtos';

/**
 * Tree node for hierarchical display
 * Enhanced node with children and UI state
 */
export interface TreeNode {
  node: Node;
  children: TreeNode[];
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  parentId: string | null;
}

/**
 * Full hierarchy tree structure
 */
export interface HierarchyTree {
  rootNodes: TreeNode[];  // Top-level nodes (no parents)
  nodeMap: Map<string, TreeNode>; // Quick lookup by node ID
}

/**
 * Parameters for building hierarchy tree
 */
export interface BuildHierarchyTreeParams {
  nodes: Node[];
  attributes: import('./backend-dtos').Attribute[];
  expandedNodeIds?: Set<string>;
  selectedNodeId?: string | null;
}
