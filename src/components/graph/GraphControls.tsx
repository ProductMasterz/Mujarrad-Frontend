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
    <div className="flex items-center gap-4 px-4 py-3 bg-white border-b border-[#e6e6e6] text-[#4f4f4f]">
      <div className="text-sm font-medium">Show:</div>

      {/* Node type filters */}
      <label className="flex items-center gap-2 text-sm cursor-pointer text-[#4f4f4f]">
        <input
          type="checkbox"
          checked={viewMode.showContext}
          onChange={(e) => onViewModeChange({ showContext: e.target.checked })}
          className="rounded"
        />
        <span>Context Nodes</span>
      </label>

      <label className="flex items-center gap-2 text-sm cursor-pointer text-[#4f4f4f]">
        <input
          type="checkbox"
          checked={viewMode.showRegular}
          onChange={(e) => onViewModeChange({ showRegular: e.target.checked })}
          className="rounded"
        />
        <span>Regular Nodes</span>
      </label>

      <label className="flex items-center gap-2 text-sm cursor-pointer text-[#4f4f4f]">
        <input
          type="checkbox"
          checked={viewMode.showConversation}
          onChange={(e) => onViewModeChange({ showConversation: e.target.checked })}
          className="rounded"
        />
        <span>Conversation Nodes</span>
      </label>

      <label className="flex items-center gap-2 text-sm cursor-pointer text-[#4f4f4f]">
        <input
          type="checkbox"
          checked={viewMode.showBlocks}
          onChange={(e) => onViewModeChange({ showBlocks: e.target.checked })}
          className="rounded"
        />
        <span>Block Nodes</span>
      </label>

      {/* Edge type filters */}
      <div className="w-px h-4 bg-[#d9d9d9]" />

      <label className="flex items-center gap-2 text-sm cursor-pointer text-[#4f4f4f]">
        <input
          type="checkbox"
          checked={viewMode.showContains}
          onChange={(e) => onViewModeChange({ showContains: e.target.checked })}
          className="rounded"
        />
        <span>Hierarchy</span>
      </label>

      <label className="flex items-center gap-2 text-sm cursor-pointer text-[#4f4f4f]">
        <input
          type="checkbox"
          checked={viewMode.showReferences}
          onChange={(e) => onViewModeChange({ showReferences: e.target.checked })}
          className="rounded"
        />
        <span>References</span>
      </label>

      <label className="flex items-center gap-2 text-sm cursor-pointer text-[#4f4f4f]">
        <input
          type="checkbox"
          checked={viewMode.showCustomRelations}
          onChange={(e) => onViewModeChange({ showCustomRelations: e.target.checked })}
          className="rounded"
        />
        <span>Relations</span>
      </label>
    </div>
  );
}