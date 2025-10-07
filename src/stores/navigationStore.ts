/**
 * Navigation store for managing UI state
 * Tracks selected nodes, expanded state, and graph view mode
 */

import { create } from 'zustand';
import { GraphViewMode } from '@/types/graph';
import { DEFAULT_GRAPH_VIEW_MODE } from '@/lib/graph-utils';

interface NavigationState {
  // Current workspace
  workspaceSlug: string | null;

  // Selected node
  selectedNodeId: string | null;

  // Hierarchy tree state
  expandedNodeIds: Set<string>;

  // Graph view mode
  graphViewMode: GraphViewMode;

  // View mode (hierarchy, graph, split)
  viewMode: 'hierarchy' | 'graph' | 'split';

  // Actions
  setWorkspace: (slug: string) => void;
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
  workspaceSlug: null,
  selectedNodeId: null,
  expandedNodeIds: new Set<string>(),
  graphViewMode: DEFAULT_GRAPH_VIEW_MODE,
  viewMode: 'hierarchy',

  // Actions
  setWorkspace: (slug: string) => {
    set({ workspaceSlug: slug });
  },

  setSelectedNode: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId });
  },

  toggleNodeExpanded: (nodeId: string) => {
    const { expandedNodeIds } = get();
    const newExpanded = new Set(expandedNodeIds);

    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }

    set({ expandedNodeIds: newExpanded });
  },

  expandNode: (nodeId: string) => {
    const { expandedNodeIds } = get();
    const newExpanded = new Set(expandedNodeIds);
    newExpanded.add(nodeId);
    set({ expandedNodeIds: newExpanded });
  },

  collapseNode: (nodeId: string) => {
    const { expandedNodeIds } = get();
    const newExpanded = new Set(expandedNodeIds);
    newExpanded.delete(nodeId);
    set({ expandedNodeIds: newExpanded });
  },

  expandAll: (nodeIds: string[]) => {
    const newExpanded = new Set(nodeIds);
    set({ expandedNodeIds: newExpanded });
  },

  collapseAll: () => {
    set({ expandedNodeIds: new Set<string>() });
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
      workspaceSlug: null,
      selectedNodeId: null,
      expandedNodeIds: new Set<string>(),
      graphViewMode: DEFAULT_GRAPH_VIEW_MODE,
      viewMode: 'hierarchy',
    });
  },
}));
