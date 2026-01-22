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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Linked Frame
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                This frame is linked to a node
                {frameTitle && (
                  <>
                    : <span className="font-medium">&quot;{frameTitle}&quot;</span>
                  </>
                )}
                . What would you like to do?
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={onDeleteBoth}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Delete Both Frame and Node
            </button>
            <button
              onClick={onDeleteFrameOnly}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Delete Frame Only (Keep Node)
            </button>
            <button
              onClick={onCancel}
              className="w-full px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
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
