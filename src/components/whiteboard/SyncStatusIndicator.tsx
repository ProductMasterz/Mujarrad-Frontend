'use client';

/**
 * SyncStatusIndicator - Shows the current sync status of the whiteboard
 */

import React, { useState, useEffect } from 'react';
import { useWhiteboardStore } from '@/stores/whiteboardStore';
import { SyncStatus } from '@/types/whiteboard';

interface SyncStatusIndicatorProps {
  onRetry?: () => void;
}

export function SyncStatusIndicator({ onRetry }: SyncStatusIndicatorProps) {
  const syncStatus = useWhiteboardStore((state) => state.syncStatus);
  const lastSyncError = useWhiteboardStore((state) => state.lastSyncError);
  const isSaving = useWhiteboardStore((state) => state.isSaving);

  // Show "Saved" briefly after successful save
  const [showSaved, setShowSaved] = useState(false);

  // Combine sync status with saving status
  const effectiveStatus: SyncStatus | 'saving' = isSaving
    ? 'syncing'
    : syncStatus;

  // Show "Saved" for 2 seconds after syncing completes
  useEffect(() => {
    if (effectiveStatus === 'idle' && !isSaving) {
      setShowSaved(true);
      const timer = setTimeout(() => {
        setShowSaved(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [effectiveStatus, isSaving]);

  // Don't render anything when idle and not recently saved
  if (effectiveStatus === 'idle' && !showSaved) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-1.5 text-sm text-foreground shadow-sm backdrop-blur-sm">
      {effectiveStatus === 'syncing' && (
        <>
          <SpinnerIcon className="w-4 h-4 text-blue-500 animate-spin" />
          <span className="text-muted-foreground">Saving...</span>
        </>
      )}

      {effectiveStatus === 'idle' && showSaved && (
        <>
          <CheckIcon className="w-4 h-4 text-green-500" />
          <span className="text-muted-foreground">Saved</span>
        </>
      )}

      {effectiveStatus === 'error' && (
        <>
          <ErrorIcon className="w-4 h-4 text-red-500" />
          <span className="text-red-600 dark:text-red-400">
            {lastSyncError || 'Sync failed'}
          </span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="ml-1 rounded px-2 py-0.5 text-xs text-red-700 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
            >
              Retry
            </button>
          )}
        </>
      )}
    </div>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default SyncStatusIndicator;
