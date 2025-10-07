/**
 * TreeNode component
 * Recursive component for rendering tree nodes with expand/collapse
 */

'use client';

import React from 'react';
import { TreeNode as TreeNodeType } from '@/types/hierarchy';
import { NodeIcon } from './NodeIcon';

interface TreeNodeProps {
  treeNode: TreeNodeType;
  onSelect: (nodeId: string) => void;
  onToggleExpand: (nodeId: string) => void;
}

/**
 * TreeNode component
 * Displays a single tree node with children
 */
export function TreeNode({ treeNode, onSelect, onToggleExpand }: TreeNodeProps) {
  const { node, children, level, isExpanded, isSelected } = treeNode;
  const hasChildren = children.length > 0;

  const handleClick = () => {
    onSelect(node.id.toString());
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      onToggleExpand(node.id.toString());
    }
  };

  return (
    <div>
      {/* Node row */}
      <div
        className={`
          flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800
          ${isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''}
        `}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
