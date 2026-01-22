'use client';

/**
 * WhiteboardContextMenu - Custom context menu for whiteboard elements
 * Allows users to promote whiteboard shapes to show in space list and manage sync
 */

import React from 'react';
import {
  ListBulletIcon,
  LinkIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

interface WhiteboardContextMenuProps {
  x: number;
  y: number;
  isLinked?: boolean;
  onShowInSpaceList: () => void;
  onViewInHierarchy?: () => void;
  onUnlink?: () => void;
  onClose: () => void;
}

export function WhiteboardContextMenu({
  x,
  y,
  isLinked = false,
  onShowInSpaceList,
  onViewInHierarchy,
  onUnlink,
  onClose,
}: WhiteboardContextMenuProps) {
  return (
    <>
      {/* Backdrop to close menu on click outside */}
      <div className="fixed inset-0 z-50" onClick={onClose} />
      {/* Menu */}
      <div
        className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[180px]"
        style={{ left: x, top: y }}
      >
        <button
          onClick={() => {
            onShowInSpaceList();
            onClose();
          }}
          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
        >
          <ListBulletIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          Show in Space List
        </button>

        {isLinked && onViewInHierarchy && (
          <button
            onClick={() => {
              onViewInHierarchy();
              onClose();
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <EyeIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            View in Hierarchy
          </button>
        )}

        {isLinked && onUnlink && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
            <button
              onClick={() => {
                onUnlink();
                onClose();
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-orange-600 dark:text-orange-400"
            >
              <LinkIcon className="w-4 h-4" />
              Unlink from Node
            </button>
          </>
        )}
      </div>
    </>
  );
}
