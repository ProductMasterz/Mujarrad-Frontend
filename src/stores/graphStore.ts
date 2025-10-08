/**
 * Graph Store (Zustand)
 *
 * Manages UI state for the graph visualization:
 * - View mode filters (show/hide node types and edge types)
 * - Selected node for highlighting
 * - Graph layout preferences
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { GraphViewMode } from '@/types/graph';

export interface GraphState {
  // View mode filters
  viewMode: GraphViewMode;

  // Selected node for highlighting
  selectedNodeId: string | null;

  // Actions
  setShowContext: (show: boolean) => void;
  setShowRegular: (show: boolean) => void;
  setShowContains: (show: boolean) => void;
  setShowReferences: (show: boolean) => void;
  setViewMode: (mode: GraphViewMode) => void;
  resetViewMode: () => void;
  setSelectedNode: (nodeId: string | null) => void;
}

const DEFAULT_VIEW_MODE: GraphViewMode = {
  showContext: true,
  showRegular: true,
  showContains: true,
  showReferences: true,
};

export const useGraphStore = create<GraphState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        viewMode: DEFAULT_VIEW_MODE,
        selectedNodeId: null,

        // Toggle visibility of context nodes
        setShowContext: (show: boolean) => {
          set((state) => ({
            viewMode: { ...state.viewMode, showContext: show },
          }));
        },

        // Toggle visibility of regular nodes
        setShowRegular: (show: boolean) => {
          set((state) => ({
            viewMode: { ...state.viewMode, showRegular: show },
          }));
        },

        // Toggle visibility of contains edges
        setShowContains: (show: boolean) => {
          set((state) => ({
            viewMode: { ...state.viewMode, showContains: show },
          }));
        },

        // Toggle visibility of references edges
        setShowReferences: (show: boolean) => {
          set((state) => ({
            viewMode: { ...state.viewMode, showReferences: show },
          }));
        },

        // Set entire view mode at once
        setViewMode: (mode: GraphViewMode) => {
          set(() => ({ viewMode: mode }));
        },

        // Reset view mode to defaults
        resetViewMode: () => {
          set(() => ({ viewMode: DEFAULT_VIEW_MODE }));
        },

        // Set selected node for highlighting
        setSelectedNode: (nodeId: string | null) => {
          set(() => ({ selectedNodeId: nodeId }));
        },
      }),
      {
        name: 'graph-store', // localStorage key
        // Only persist view mode, not selected node
        partialize: (state) => ({ viewMode: state.viewMode }),
      }
    ),
    {
      name: 'graph-store',
    }
  )
);
