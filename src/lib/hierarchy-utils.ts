/**
 * Hierarchy utilities for building tree structures
 * Transforms flat node/attribute lists into hierarchical trees
 */

import type { Node, Attribute } from '@/types/backend-dtos';
import { TreeNode, HierarchyTree, BuildHierarchyTreeParams } from '@/types/hierarchy';
import { getEffectiveVisibility, NodeVisibility } from '@/types/node-system';

/**
 * Check if a node should appear in the hierarchy tree (node list)
 * Uses the new visibility system with legacy fallbacks
 */
function shouldShowInHierarchy(node: Node): boolean {
  const visibility = getEffectiveVisibility(node.nodeDetails as Record<string, unknown> | undefined);
  return visibility === NodeVisibility.VISIBLE;
}

/**
 * Build hierarchical tree from flat nodes and attributes
 * Uses 'contains' relationships to establish parent-child connections
 * Filters out block-only nodes (nodes that only appear as content blocks)
 * @param nodes - Array of nodes
 * @param attributes - Array of attributes (relationships)
 * @param expandedNodeIds - Array of expanded node IDs (optional)
 * @param selectedNodeId - Currently selected node ID (optional)
 * @returns Hierarchical tree structure with root nodes and lookup map
 */
export function buildHierarchyTree(
  nodes: Node[],
  attributes: Attribute[],
  expandedNodeIds: string[] = [],
  selectedNodeId: string | null = null
): HierarchyTree {
  // Filter out block-only nodes - they shouldn't appear in the hierarchy
  const visibleNodes = nodes.filter(shouldShowInHierarchy);

  // Build parent-child relationship map using 'contains' attributes
  const childrenMap = new Map<string, string[]>(); // parentId -> childIds[]
  const parentMap = new Map<string, string[]>(); // childId -> parentIds[]

  // Filter for 'contains' relationships only (check both attributeName and attributeType)
  const containsRelations = attributes.filter(
    attr => {
      const name = (attr.attributeName || '').toString().toLowerCase();
      const type = (attr.attributeType || '').toString().toLowerCase();
      return name === 'contains' || type === 'contains';
    }
  );

  for (const attr of containsRelations) {
    const parentId = attr.sourceNodeId.toString();
    const childId = attr.targetNodeId.toString();

    if (!childrenMap.has(parentId)) {
      childrenMap.set(parentId, []);
    }
    childrenMap.get(parentId)!.push(childId);
    if (!parentMap.has(childId)) {
      parentMap.set(childId, []);
    }
    parentMap.get(childId)!.push(parentId);
  }

  // Create node lookup map (only for visible nodes)
  const nodeMap = new Map<string, Node>();
  visibleNodes.forEach(node => nodeMap.set(node.id.toString(), node));

  // Recursive function to build tree node
  const buildTreeNode = (node: Node, level: number): TreeNode => {
    const nodeIdStr = node.id.toString();
    const childIds = childrenMap.get(nodeIdStr) || [];
    const children: TreeNode[] = childIds
      .map(childId => nodeMap.get(childId))
      .filter((child): child is Node => child !== undefined)
      .map(childNode => buildTreeNode(childNode, level + 1));

    return {
      node,
      children,
      level,
      isExpanded: expandedNodeIds.includes(nodeIdStr),
      isSelected: nodeIdStr === selectedNodeId,
      parentIds: parentMap.get(nodeIdStr) || [],
    };
  };

  // Find root nodes (visible nodes without parents OR nodes whose parents don't exist in visible nodes)
  const rootNodes: TreeNode[] = [];
  for (const node of visibleNodes) {
    const parentIds = parentMap.get(node.id.toString()) || [];
    // Node is a root if: no parents OR none of its parents exist in visible nodes
    if (parentIds.length === 0 || !parentIds.some(pid => nodeMap.has(pid))) {
      rootNodes.push(buildTreeNode(node, 0));
    }
  }

  // Build tree node map for quick lookup
  const treeNodeMap = new Map<string, TreeNode>();
  const addToMap = (treeNode: TreeNode) => {
    treeNodeMap.set(treeNode.node.id.toString(), treeNode);
    treeNode.children.forEach(addToMap);
  };
  rootNodes.forEach(addToMap);

  return {
    rootNodes,
    nodeMap: treeNodeMap,
  };
}

/**
 * Find all ancestor node IDs for a given node
 * @param nodeId - The node to find ancestors for
 * @param attributes - All attributes (contains relationships)
 * @returns Array of ancestor node IDs (immediate parent to root)
 */
export function findAncestors(nodeId: string, attributes: Attribute[]): string[] {
  const parentMap = new Map<string, string[]>();

  attributes
    .filter(attr => {
      const name = (attr.attributeName || '').toString().toLowerCase();
      const type = (attr.attributeType || '').toString().toLowerCase();
      return name === 'contains' || type === 'contains';
    })
    .forEach(attr => {
      const childId = attr.targetNodeId.toString();
      const parentId = attr.sourceNodeId.toString();
      if (!parentMap.has(childId)) parentMap.set(childId, []);
      parentMap.get(childId)!.push(parentId);
    });

  const ancestors = new Set<string>();
  const queue = parentMap.get(nodeId) || [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (ancestors.has(current)) continue;
    ancestors.add(current);
    const parents = parentMap.get(current) || [];
    queue.push(...parents);
  }

  return Array.from(ancestors);
}

/**
 * Check if a node is a descendant of another node
 * @param nodeId - The potential descendant node
 * @param ancestorId - The potential ancestor node
 * @param attributes - All attributes (contains relationships)
 * @returns True if nodeId is a descendant of ancestorId
 */
export function isDescendant(
  nodeId: string,
  ancestorId: string,
  attributes: Attribute[]
): boolean {
  const ancestors = findAncestors(nodeId, attributes);
  return ancestors.includes(ancestorId);
}
