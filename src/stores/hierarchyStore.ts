'use client';

/**
 * Hierarchy Store (Zustand)
 *
 * Manages UI state for the hierarchy tree view:
 * - Expanded/collapsed node IDs
 * - Selected node ID
 * - Actions to toggle expand/collapse
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface HierarchyState {
  // UI State
  expandedNodeIds: string[];
  selectedNodeId: string | null;

  // Actions
  toggleExpanded: (nodeId: string) => void;
  expandNode: (nodeId: string) => void;
  collapseNode: (nodeId: string) => void;
  expandAll: (nodeIds: string[]) => void;
  collapseAll: () => void;
  setSelectedNode: (nodeId: string | null) => void;

  // Helper queries
  isExpanded: (nodeId: string) => boolean;
  isSelected: (nodeId: string) => boolean;
}

export const useHierarchyStore = create<HierarchyState>()(
  devtools(
    (set, get) => ({
      // Initial state
      expandedNodeIds: [],
      selectedNodeId: null,

      // Toggle expanded state
      toggleExpanded: (nodeId: string) => {
        set((state) => {
          const isCurrentlyExpanded = state.expandedNodeIds.includes(nodeId);
          const newExpanded = isCurrentlyExpanded
            ? state.expandedNodeIds.filter((id) => id !== nodeId)
            : [...state.expandedNodeIds, nodeId];
          return { expandedNodeIds: newExpanded };
        });
      },

      // Expand a single node
      expandNode: (nodeId: string) => {
        set((state) => {
          if (state.expandedNodeIds.includes(nodeId)) {
            return state;
          }
          return { expandedNodeIds: [...state.expandedNodeIds, nodeId] };
        });
      },

      // Collapse a single node
      collapseNode: (nodeId: string) => {
        set((state) => ({
          expandedNodeIds: state.expandedNodeIds.filter((id) => id !== nodeId),
        }));
      },

      // Expand all specified nodes
      expandAll: (nodeIds: string[]) => {
        set(() => ({
          expandedNodeIds: nodeIds,
        }));
      },

      // Collapse all nodes
      collapseAll: () => {
        set(() => ({
          expandedNodeIds: [],
        }));
      },

      // Set selected node
      setSelectedNode: (nodeId: string | null) => {
        set(() => ({ selectedNodeId: nodeId }));
      },

      // Check if node is expanded
      isExpanded: (nodeId: string) => {
        return get().expandedNodeIds.includes(nodeId);
      },

      // Check if node is selected
      isSelected: (nodeId: string) => {
        return get().selectedNodeId === nodeId;
      },
    }),
    {
      name: 'hierarchy-store',
    }
  )
);
