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
  showPerson: true,
  showPlace: true,
  showAction: true,
  showTopic: true,
  showEvent: true,
  showEntityRelations: true,

  // System
  showSystem: true,
  showRegular: true,
  showContext: true,
  showAssumption: true,
  showTemplate: true,
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
      }
    ),
    {
      name: 'graph-store',
    }
  )
);