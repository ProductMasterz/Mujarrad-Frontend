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
      <div className="fixed inset-0 z-50" onClick={onClose} />

      <div
        className="fixed z-50 min-w-[180px] rounded-lg border border-border bg-background py-1 text-foreground shadow-lg"
        style={{ left: x, top: y }}
      >
        <button
          onClick={() => {
            onShowInSpaceList();
            onClose();
          }}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-muted"
        >
          <ListBulletIcon className="h-4 w-4 text-muted-foreground" />
          Show in Space List
        </button>

        {isLinked && onViewInHierarchy && (
          <button
            onClick={() => {
              onViewInHierarchy();
              onClose();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-muted"
          >
            <EyeIcon className="h-4 w-4 text-muted-foreground" />
            View in Hierarchy
          </button>
        )}

        {isLinked && onUnlink && (
          <>
            <div className="my-1 border-t border-border" />
            <button
              onClick={() => {
                onUnlink();
                onClose();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-orange-600 transition hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950/30"
            >
              <LinkIcon className="h-4 w-4" />
              Unlink from Node
            </button>
          </>
        )}
      </div>
    </>
  );
}