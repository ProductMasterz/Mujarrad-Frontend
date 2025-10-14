'use client';

/**
 * Navigation store for managing UI state
 * Tracks selected nodes, expanded state, and graph view mode
 */

import { create } from 'zustand';
import { GraphViewMode } from '@/types/graph';
import { DEFAULT_GRAPH_VIEW_MODE } from '@/lib/graph-utils';

interface NavigationState {
  // Current space
  spaceSlug: string | null;

  // Selected node
  selectedNodeId: string | null;

  // Hierarchy tree state
  expandedNodeIds: string[];

  // Graph view mode
  graphViewMode: GraphViewMode;

  // View mode (hierarchy, graph, split)
  viewMode: 'hierarchy' | 'graph' | 'split';

  // Actions
  setSpace: (slug: string) => void;
  setSelectedNode: (nodeId: string | null) => void;
  toggleNodeExpanded: (nodeId: string) => void;
  expandNode: (nodeId: string) => void;
  collapseNode: (nodeId: string) => void;
  expandAll: (nodeIds: string[]) => void;
  collapseAll: () => void;
  setGraphViewMode: (mode: Partial<GraphViewMode>) => void;
  setViewMode: (mode: 'hierarchy' | 'graph' | 'split') => void;
  reset: () => void;
}

/**
 * Navigation store
 * Manages all UI navigation state
 */
export const useNavigationStore = create<NavigationState>((set, get) => ({
  // Initial state
  spaceSlug: null,
  selectedNodeId: null,
  expandedNodeIds: [],
  graphViewMode: DEFAULT_GRAPH_VIEW_MODE,
  viewMode: 'hierarchy',

  // Actions
  setSpace: (slug: string) => {
    set({ spaceSlug: slug });
  },

  setSelectedNode: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId });
  },

  toggleNodeExpanded: (nodeId: string) => {
    const { expandedNodeIds } = get();
    const isExpanded = expandedNodeIds.includes(nodeId);

    const newExpanded = isExpanded
      ? expandedNodeIds.filter((id) => id !== nodeId)
      : [...expandedNodeIds, nodeId];

    set({ expandedNodeIds: newExpanded });
  },

  expandNode: (nodeId: string) => {
    const { expandedNodeIds } = get();
    if (expandedNodeIds.includes(nodeId)) {
      return;
    }
    set({ expandedNodeIds: [...expandedNodeIds, nodeId] });
  },

  collapseNode: (nodeId: string) => {
    const { expandedNodeIds } = get();
    set({ expandedNodeIds: expandedNodeIds.filter((id) => id !== nodeId) });
  },

  expandAll: (nodeIds: string[]) => {
    set({ expandedNodeIds: nodeIds });
  },

  collapseAll: () => {
    set({ expandedNodeIds: [] });
  },

  setGraphViewMode: (mode: Partial<GraphViewMode>) => {
    const { graphViewMode } = get();
    set({
      graphViewMode: {
        ...graphViewMode,
        ...mode,
      },
    });
  },

  setViewMode: (mode: 'hierarchy' | 'graph' | 'split') => {
    set({ viewMode: mode });
  },

  reset: () => {
    set({
      spaceSlug: null,
      selectedNodeId: null,
      expandedNodeIds: [],
      graphViewMode: DEFAULT_GRAPH_VIEW_MODE,
      viewMode: 'hierarchy',
    });
  },
}));
