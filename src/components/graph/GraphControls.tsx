/**
 * GraphControls component
 * Controls for filtering graph view
 */

'use client';

import React from 'react';
import { GraphViewMode } from '@/types/graph';

interface GraphControlsProps {
  viewMode: GraphViewMode;
  onViewModeChange: (mode: Partial<GraphViewMode>) => void;
}

/**
 * GraphControls component
 * Toggle filters for node and edge types
 */
export function GraphControls({ viewMode, onViewModeChange }: GraphControlsProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="text-sm font-medium">Show:</div>

      {/* Node type filters */}
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={viewMode.showContext}
          onChange={e => onViewModeChange({ showContext: e.target.checked })}
          className="rounded"
        />
        <span>Context Nodes</span>
      </label>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={viewMode.showRegular}
          onChange={e => onViewModeChange({ showRegular: e.target.checked })}
          className="rounded"
        />
        <span>Regular Nodes</span>
      </label>

      {/* Edge type filters */}
      <div className="w-px h-4 bg-gray-300 dark:bg-gray-700" />

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={viewMode.showContains}
          onChange={e => onViewModeChange({ showContains: e.target.checked })}
          className="rounded"
        />
        <span>Hierarchy</span>
      </label>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={viewMode.showReferences}
          onChange={e => onViewModeChange({ showReferences: e.target.checked })}
          className="rounded"
        />
        <span>References</span>
      </label>
    </div>
  );
}
