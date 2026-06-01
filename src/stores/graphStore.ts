'use client';

/**
 * Graph Store (Zustand)
 *
 * Manages UI state for the graph visualization:
 * - View mode filters
 * - Selected node for highlighting
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { GraphViewMode } from '@/types/graph';

export interface GraphState {
  viewMode: GraphViewMode;
  selectedNodeId: string | null;

  setViewMode: (mode: GraphViewMode) => void;
  resetViewMode: () => void;
  setSelectedNode: (nodeId: string | null) => void;
}

const DEFAULT_VIEW_MODE: GraphViewMode = {
  // Chat
  showChat: true,
  showConversationNodes: false,
  showUserMessages: false,
  showAssistantMessages: false,
  showChatRelations: false,

  // Entities
  showEntities: true,
  hiddenSemanticTypes: [],
  showEntityRelations: true,

  // System
  showSystem: true,
  showRegular: true,
  showContext: true,
  showAttribute: true,
  showBlocks: false,

  // Other
  showReferences: true,
};

export const useGraphStore = create<GraphState>()(
  devtools(
    persist(
      (set) => ({
        viewMode: DEFAULT_VIEW_MODE,
        selectedNodeId: null,

        setViewMode: (mode: GraphViewMode) => {
          set(() => ({ viewMode: mode }));
        },

        resetViewMode: () => {
          set(() => ({ viewMode: DEFAULT_VIEW_MODE }));
        },

        setSelectedNode: (nodeId: string | null) => {
          set(() => ({ selectedNodeId: nodeId }));
        },
      }),
      {
        name: 'graph-store',
        partialize: (state) => ({ viewMode: state.viewMode }),
        merge: (persistedState, currentState) => {
          const persisted = persistedState as Partial<GraphState> | undefined;

          return {
            ...currentState,
            ...persisted,
            viewMode: {
              ...DEFAULT_VIEW_MODE,
              ...(persisted?.viewMode || {}),
              hiddenSemanticTypes:
                persisted?.viewMode?.hiddenSemanticTypes || DEFAULT_VIEW_MODE.hiddenSemanticTypes,
            },
          };
        },
      }
    ),
    {
      name: 'graph-store',
    }
  )
);