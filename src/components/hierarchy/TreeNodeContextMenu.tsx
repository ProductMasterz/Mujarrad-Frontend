'use client';

/**
 * TreeNodeContextMenu - Context menu for hierarchy tree nodes
 * Provides whiteboard integration actions
 */

import React from 'react';
import { EyeIcon, PlusIcon } from '@heroicons/react/24/outline';

interface TreeNodeContextMenuProps {
  x: number;
  y: number;
  nodeId: string;
  isLinkedToWhiteboard?: boolean;
  onViewOnWhiteboard?: (nodeId: string) => void;
  onCreateFrameOnWhiteboard?: (nodeId: string) => void;
  onClose: () => void;
}

export function TreeNodeContextMenu({
  x,
  y,
  nodeId,
  isLinkedToWhiteboard,
  onViewOnWhiteboard,
  onCreateFrameOnWhiteboard,
  onClose,
}: TreeNodeContextMenuProps) {
  // Adjust position to keep menu in viewport
  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - 150);

  return (
    <>
      {/* Backdrop to close menu on click outside */}
      <div className="fixed inset-0 z-50" onClick={onClose} />
      {/* Menu */}
      <div
        className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[180px]"
        style={{ left: adjustedX, top: adjustedY }}
      >
        {isLinkedToWhiteboard && onViewOnWhiteboard && (
          <button
            onClick={() => {
              onViewOnWhiteboard(nodeId);
              onClose();
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <EyeIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            View on Whiteboard
          </button>
        )}

        {!isLinkedToWhiteboard && onCreateFrameOnWhiteboard && (
          <button
            onClick={() => {
              onCreateFrameOnWhiteboard(nodeId);
              onClose();
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            Create Frame on Whiteboard
          </button>
        )}

        {!isLinkedToWhiteboard && !onViewOnWhiteboard && !onCreateFrameOnWhiteboard && (
          <div className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500">
            No whiteboard actions available
          </div>
        )}
      </div>
    </>
  );
}

export default TreeNodeContextMenu;
