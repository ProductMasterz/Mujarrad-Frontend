'use client';

/**
 * DeleteLinkedFrameDialog - Confirmation dialog when deleting a frame that is linked to a node
 */

import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface DeleteLinkedFrameDialogProps {
  isOpen: boolean;
  frameTitle?: string;
  onDeleteBoth: () => void;
  onDeleteFrameOnly: () => void;
  onCancel: () => void;
}

export function DeleteLinkedFrameDialog({
  isOpen,
  frameTitle,
  onDeleteBoth,
  onDeleteFrameOnly,
  onCancel,
}: DeleteLinkedFrameDialogProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onCancel}
      />
      {/* Dialog */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onCancel}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 text-foreground shadow-xl">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
              <ExclamationTriangleIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                Delete Linked Frame
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                This frame is linked to a node
                {frameTitle && (
                  <>
                    : <span className="font-medium text-foreground">&quot;{frameTitle}&quot;</span>
                  </>
                )}
                . What would you like to do?
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={onDeleteBoth}
              className="w-full rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Delete Both Frame and Node
            </button>

            <button
              onClick={onDeleteFrameOnly}
              className="w-full rounded-xl border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted/80"
            >
              Delete Frame Only (Keep Node)
            </button>

            <button
              onClick={onCancel}
              className="w-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default DeleteLinkedFrameDialog;
