/**
 * HierarchyNavigator component
 * Container for displaying hierarchical tree navigation
 */

'use client';

import React from 'react';
import type { Node, Attribute } from '@/types/backend-dtos';
import { useHierarchyTree } from '@/hooks/useHierarchyTree';
import { useHierarchyStore } from '@/stores/hierarchyStore';
import { TreeNode } from './TreeNode';

interface HierarchyNavigatorProps {
  nodes: Node[];
  attributes: Attribute[];
  onNodeSelect?: (nodeId: string) => void;
}

/**
 * HierarchyNavigator component
 * Displays the full hierarchy tree with navigation
 */
export function HierarchyNavigator({
  nodes,
  attributes,
  onNodeSelect,
}: HierarchyNavigatorProps) {
  const expandedNodeIds = useHierarchyStore(state => state.expandedNodeIds);
  const selectedNodeId = useHierarchyStore(state => state.selectedNodeId);
  const toggleExpanded = useHierarchyStore(state => state.toggleExpanded);
  const setSelectedNode = useHierarchyStore(state => state.setSelectedNode);

  const hierarchyTree = useHierarchyTree({
    nodes,
    attributes,
    expandedNodeIds,
    selectedNodeId,
  });

  const handleSelect = (nodeId: string) => {
    setSelectedNode(nodeId);
    if (onNodeSelect) {
      onNodeSelect(nodeId);
    }
  };

  const handleToggleExpand = (nodeId: string) => {
    toggleExpanded(nodeId);
  };

  if (hierarchyTree.rootNodes.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500">
        No pages in hierarchy. Create your first page to get started.
      </div>
    );
  }

  return (
    <div className="overflow-auto h-full">
      <div role="tree" className="py-2">
        {hierarchyTree.rootNodes.map(rootNode => (
          <TreeNode
            key={rootNode.node.id}
            treeNode={rootNode}
            onSelect={handleSelect}
            onToggleExpand={handleToggleExpand}
          />
        ))}
      </div>
    </div>
  );
}
