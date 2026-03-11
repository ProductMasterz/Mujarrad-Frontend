'use client';

/**
 * Navigation store for managing UI state
 * Tracks selected nodes, expanded state, graph view mode, and navigation scope.
 *
 * Navigation Scope:
 * Determines which actions are available in the UI at each level:
 * - 'spaces'    : Viewing list of all spaces (Add: space only, No whiteboard)
 * - 'space'     : Inside a specific space (Add: node/context, Has whiteboard)
 * - 'node'      : Inside a specific node (Add: node/context, Has whiteboard)
 * - 'whiteboard': Inside the whiteboard view
 */

import { create } from 'zustand';
import { GraphViewMode } from '@/types/graph';
import { DEFAULT_GRAPH_VIEW_MODE } from '@/lib/graph-utils';

// ============================================================================
// Navigation Scope Types & Configuration
// ============================================================================

export type NavigationScope = 'spaces' | 'space' | 'node' | 'whiteboard';

// Actions available in the Add menu
export type AddAction = 'create_space' | 'create_node' | 'create_context';

// Actions available in the More menu (three dots)
export type MoreAction =
  | 'share'
  | 'open_new_tab'
  | 'open_as_node'
  | 'lock'
  | 'graph'
  | 'whiteboard'
  | 'delete'
  | 'clear_space'
  | 'move_to'
  | 'settings';

// Configuration for each scope
interface ScopeConfig {
  addActions: AddAction[];
  moreActions: MoreAction[];
  addButtonTooltip: string;
}

// Scope configurations - defines what's available at each level
const SCOPE_CONFIGS: Record<NavigationScope, ScopeConfig> = {
  spaces: {
    addActions: ['create_space'],
    moreActions: ['share', 'settings'],
    addButtonTooltip: 'Create new space',
  },
    space: {
    addActions: ['create_node', 'create_context'],
    moreActions: ['share', 'open_new_tab', 'graph', 'whiteboard', 'clear_space'],
    addButtonTooltip: 'Create new node',
  },
  node: {
    addActions: ['create_node', 'create_context'],
    moreActions: ['share', 'open_new_tab', 'open_as_node', 'lock', 'graph', 'whiteboard', 'delete', 'move_to'],
    addButtonTooltip: 'Create new node',
  },
  whiteboard: {
    addActions: ['create_node', 'create_context'],
    moreActions: ['share', 'open_new_tab', 'clear_space'],
    addButtonTooltip: 'Create new node',
  },
};

// Action labels for UI rendering
export const ADD_ACTION_LABELS: Record<AddAction, string> = {
  create_space: 'New Space',
  create_node: 'New Node',
  create_context: 'New Context',
};

export const MORE_ACTION_LABELS: Record<MoreAction, string> = {
  share: 'Share',
  open_new_tab: 'Open in New Tab',
  open_as_node: 'Open as Node',
  lock: 'Lock',
  graph: 'Graph View',
  whiteboard: 'Whiteboard',
  delete: 'Delete',
  clear_space: 'Clear Space',
  move_to: 'Move to',
  settings: 'Settings',
};

// ============================================================================
// Store Interface
// ============================================================================

interface NavigationState {
  // Current space
  spaceSlug: string | null;
  spaceId: string | null;

  // Selected node
  selectedNodeId: string | null;

  // Hierarchy tree state
  expandedNodeIds: string[];

  // Graph view mode
  graphViewMode: GraphViewMode;

  // View mode (hierarchy, graph, split)
  viewMode: 'hierarchy' | 'graph' | 'split';

  // Navigation scope
  scope: NavigationScope;
  addActions: AddAction[];
  moreActions: MoreAction[];
  addButtonTooltip: string;

  // Actions
  setSpace: (slug: string, id?: string) => void;
  setSelectedNode: (nodeId: string | null) => void;
  toggleNodeExpanded: (nodeId: string) => void;
  expandNode: (nodeId: string) => void;
  collapseNode: (nodeId: string) => void;
  expandAll: (nodeIds: string[]) => void;
  collapseAll: () => void;
  setGraphViewMode: (mode: Partial<GraphViewMode>) => void;
  setViewMode: (mode: 'hierarchy' | 'graph' | 'split') => void;
  reset: () => void;

  // Scope navigation actions
  setScope: (scope: NavigationScope) => void;
  navigateToSpaces: () => void;
  navigateToSpace: (spaceSlug: string, spaceId: string) => void;
  navigateToNode: (spaceSlug: string, spaceId: string, nodeId: string) => void;
  navigateToWhiteboard: (spaceSlug: string, spaceId: string) => void;

  // Utility
  isActionAvailable: (action: AddAction | MoreAction) => boolean;
}

/**
 * Navigation store
 * Manages all UI navigation state including scope-aware menu configuration
 */
export const useNavigationStore = create<NavigationState>((set, get) => ({
  // Initial state
  spaceSlug: null,
  spaceId: null,
  selectedNodeId: null,
  expandedNodeIds: [],
  graphViewMode: DEFAULT_GRAPH_VIEW_MODE,
  viewMode: 'hierarchy',

  // Scope state - starts at spaces level
  scope: 'spaces',
  addActions: SCOPE_CONFIGS.spaces.addActions,
  moreActions: SCOPE_CONFIGS.spaces.moreActions,
  addButtonTooltip: SCOPE_CONFIGS.spaces.addButtonTooltip,

  // Actions
  setSpace: (slug: string, id?: string) => {
    set({ spaceSlug: slug, spaceId: id ?? null });
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
      spaceId: null,
      selectedNodeId: null,
      expandedNodeIds: [],
      graphViewMode: DEFAULT_GRAPH_VIEW_MODE,
      viewMode: 'hierarchy',
      scope: 'spaces',
      addActions: SCOPE_CONFIGS.spaces.addActions,
      moreActions: SCOPE_CONFIGS.spaces.moreActions,
      addButtonTooltip: SCOPE_CONFIGS.spaces.addButtonTooltip,
    });
  },

  // Scope navigation actions
  setScope: (scope: NavigationScope) => {
    set({
      scope,
      addActions: SCOPE_CONFIGS[scope].addActions,
      moreActions: SCOPE_CONFIGS[scope].moreActions,
      addButtonTooltip: SCOPE_CONFIGS[scope].addButtonTooltip,
    });
  },

  navigateToSpaces: () => {
    set({
      scope: 'spaces',
      spaceSlug: null,
      spaceId: null,
      selectedNodeId: null,
      addActions: SCOPE_CONFIGS.spaces.addActions,
      moreActions: SCOPE_CONFIGS.spaces.moreActions,
      addButtonTooltip: SCOPE_CONFIGS.spaces.addButtonTooltip,
    });
  },

  navigateToSpace: (spaceSlug: string, spaceId: string) => {
    set({
      scope: 'space',
      spaceSlug,
      spaceId,
      selectedNodeId: null,
      addActions: SCOPE_CONFIGS.space.addActions,
      moreActions: SCOPE_CONFIGS.space.moreActions,
      addButtonTooltip: SCOPE_CONFIGS.space.addButtonTooltip,
    });
  },

  navigateToNode: (spaceSlug: string, spaceId: string, nodeId: string) => {
    set({
      scope: 'node',
      spaceSlug,
      spaceId,
      selectedNodeId: nodeId,
      addActions: SCOPE_CONFIGS.node.addActions,
      moreActions: SCOPE_CONFIGS.node.moreActions,
      addButtonTooltip: SCOPE_CONFIGS.node.addButtonTooltip,
    });
  },

  navigateToWhiteboard: (spaceSlug: string, spaceId: string) => {
    set({
      scope: 'whiteboard',
      spaceSlug,
      spaceId,
      selectedNodeId: null,
      addActions: SCOPE_CONFIGS.whiteboard.addActions,
      moreActions: SCOPE_CONFIGS.whiteboard.moreActions,
      addButtonTooltip: SCOPE_CONFIGS.whiteboard.addButtonTooltip,
    });
  },

  // Utility to check if an action is available in current scope
  isActionAvailable: (action: AddAction | MoreAction) => {
    const { addActions, moreActions } = get();
    return (
      addActions.includes(action as AddAction) ||
      moreActions.includes(action as MoreAction)
    );
  },
}));

// Export scope configs for external use
export { SCOPE_CONFIGS };
