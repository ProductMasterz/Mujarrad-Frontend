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
  expandedNodeIds: Set<string>;
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
      expandedNodeIds: new Set<string>(),
      selectedNodeId: null,

      // Toggle expanded state
      toggleExpanded: (nodeId: string) => {
        set((state) => {
          const newExpanded = new Set(state.expandedNodeIds);
          if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
          } else {
            newExpanded.add(nodeId);
          }
          return { expandedNodeIds: newExpanded };
        });
      },

      // Expand a single node
      expandNode: (nodeId: string) => {
        set((state) => {
          const newExpanded = new Set(state.expandedNodeIds);
          newExpanded.add(nodeId);
          return { expandedNodeIds: newExpanded };
        });
      },

      // Collapse a single node
      collapseNode: (nodeId: string) => {
        set((state) => {
          const newExpanded = new Set(state.expandedNodeIds);
          newExpanded.delete(nodeId);
          return { expandedNodeIds: newExpanded };
        });
      },

      // Expand all specified nodes
      expandAll: (nodeIds: string[]) => {
        set(() => ({
          expandedNodeIds: new Set(nodeIds),
        }));
      },

      // Collapse all nodes
      collapseAll: () => {
        set(() => ({
          expandedNodeIds: new Set<string>(),
        }));
      },

      // Set selected node
      setSelectedNode: (nodeId: string | null) => {
        set(() => ({ selectedNodeId: nodeId }));
      },

      // Check if node is expanded
      isExpanded: (nodeId: string) => {
        return get().expandedNodeIds.has(nodeId);
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
