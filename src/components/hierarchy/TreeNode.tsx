/**
 * TreeNode component
 * Recursive component for rendering tree nodes with expand/collapse
 */

'use client';

import React, { useState } from 'react';
import { TreeNode as TreeNodeType } from '@/types/hierarchy';
import { NodeIcon } from './NodeIcon';
import { TreeNodeContextMenu } from './TreeNodeContextMenu';

interface TreeNodeProps {
  treeNode: TreeNodeType;
  onSelect: (nodeId: string) => void;
  onToggleExpand: (nodeId: string) => void;
  isLinkedToWhiteboard?: boolean;
  onViewOnWhiteboard?: (nodeId: string) => void;
  onCreateFrameOnWhiteboard?: (nodeId: string) => void;
}

/**
 * TreeNode component
 * Displays a single tree node with children
 * Memoized for performance with large trees (T085)
 */
export const TreeNode = React.memo(function TreeNode({
  treeNode,
  onSelect,
  onToggleExpand,
  isLinkedToWhiteboard,
  onViewOnWhiteboard,
  onCreateFrameOnWhiteboard,
}: TreeNodeProps) {
  const { node, children, level, isExpanded, isSelected } = treeNode;
  const hasChildren = children.length > 0;

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleClick = () => {
    onSelect(node.id.toString());
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      onToggleExpand(node.id.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ': // Space
        e.preventDefault();
        onSelect(node.id.toString());
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (hasChildren && !isExpanded) {
          onToggleExpand(node.id.toString());
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (hasChildren && isExpanded) {
          onToggleExpand(node.id.toString());
        }
        break;
      // ArrowUp/ArrowDown would require parent component coordination
      // to move selection between nodes - handled at HierarchyNavigator level
    }
  };

  return (
    <div>
      {/* Node row */}
      <div
        role="treeitem"
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={isSelected}
        tabIndex={isSelected ? 0 : -1}
        className={`
          flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500
          ${isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''}
        `}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onContextMenu={handleContextMenu}
      >
        {/* Expand/collapse button */}
        <button
          onClick={handleToggle}
          className="flex-shrink-0 w-4 h-4 flex items-center justify-center"
        >
          {hasChildren ? (
            isExpanded ? (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )
          ) : (
            <span className="w-3 h-3" />
          )}
        </button>

        {/* Node icon */}
        <NodeIcon nodeType={node.nodeType} className="w-4 h-4 flex-shrink-0" />

        {/* Node title */}
        <span className="text-sm truncate flex-1">{node.title}</span>
      </div>

      {/* Children (if expanded) */}
      {isExpanded && hasChildren && (
        <div>
          {children.map(child => (
            <TreeNode
              key={child.node.id.toString()}
              treeNode={child}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              isLinkedToWhiteboard={isLinkedToWhiteboard}
              onViewOnWhiteboard={onViewOnWhiteboard}
              onCreateFrameOnWhiteboard={onCreateFrameOnWhiteboard}
            />
          ))}
        </div>
      )}

      {/* Context menu */}
      {contextMenu && (
        <TreeNodeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          nodeId={node.id.toString()}
          isLinkedToWhiteboard={isLinkedToWhiteboard}
          onViewOnWhiteboard={onViewOnWhiteboard}
          onCreateFrameOnWhiteboard={onCreateFrameOnWhiteboard}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
});
