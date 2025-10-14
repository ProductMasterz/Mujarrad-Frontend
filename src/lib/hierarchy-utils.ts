/**
 * Hierarchy utilities for building tree structures
 * Transforms flat node/attribute lists into hierarchical trees
 */

import type { Node, Attribute } from '@/types/backend-dtos';
import { TreeNode, HierarchyTree, BuildHierarchyTreeParams } from '@/types/hierarchy';

/**
 * Build hierarchical tree from flat nodes and attributes
 * Uses 'contains' relationships to establish parent-child connections
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

  // Build parent-child relationship map using 'contains' attributes
  const childrenMap = new Map<string, string[]>(); // parentId -> childIds[]
  const parentMap = new Map<string, string>(); // childId -> parentId

  // Filter for 'contains' relationships only
  const containsRelations = attributes.filter(
    attr => attr.attributeKey.toString().toLowerCase() === 'contains'
  );

  for (const attr of containsRelations) {
    const parentId = attr.sourceNodeId.toString();
    const childId = attr.targetNodeId.toString();

    if (!childrenMap.has(parentId)) {
      childrenMap.set(parentId, []);
    }
    childrenMap.get(parentId)!.push(childId);
    parentMap.set(childId, parentId);
  }

  // Create node lookup map
  const nodeMap = new Map<string, Node>();
  nodes.forEach(node => nodeMap.set(node.id.toString(), node));

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
      parentId: parentMap.get(nodeIdStr) || null,
    };
  };

  // Find root nodes (nodes without parents OR nodes whose parents don't exist in the nodes list)
  const rootNodes: TreeNode[] = [];
  for (const node of nodes) {
    const parentId = parentMap.get(node.id.toString());
    // Node is a root if: no parent OR parent doesn't exist in nodes
    if (!parentId || !nodeMap.has(parentId)) {
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
  const ancestors: string[] = [];
  const parentMap = new Map<string, string>();

  // Build parent map from contains relationships
  attributes
    .filter(attr => attr.attributeKey.toString().toLowerCase() === 'contains')
    .forEach(attr => {
      parentMap.set(attr.targetNodeId.toString(), attr.sourceNodeId.toString());
    });

  let currentId: string | undefined = nodeId;
  while (currentId && parentMap.has(currentId)) {
    const parentId: string = parentMap.get(currentId)!;
    ancestors.push(parentId);
    currentId = parentId;
  }

  return ancestors;
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
