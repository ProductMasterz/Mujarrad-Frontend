'use client';

/**
 * WhiteboardContextMenu - Custom context menu for whiteboard elements
 * Allows users to promote whiteboard shapes to show in space list
 */

import React from 'react';
import { ListBulletIcon } from '@heroicons/react/24/outline';

interface WhiteboardContextMenuProps {
  x: number;
  y: number;
  onShowInSpaceList: () => void;
  onClose: () => void;
}

export function WhiteboardContextMenu({
  x,
  y,
  onShowInSpaceList,
  onClose,
}: WhiteboardContextMenuProps) {
  return (
    <>
      {/* Backdrop to close menu on click outside */}
      <div
        className="fixed inset-0 z-50"
        onClick={onClose}
      />
      {/* Menu */}
      <div
        className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[180px]"
        style={{ left: x, top: y }}
      >
        <button
          onClick={() => {
            onShowInSpaceList();
            onClose();
          }}
          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
        >
          <ListBulletIcon className="w-4 h-4 text-gray-500" />
          Show in Space List
        </button>
      </div>
    </>
  );
}
