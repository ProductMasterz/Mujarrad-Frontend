'use client';

import { create } from 'zustand';

export type ActionType = 'create_job' | 'create_node' | 'wire_edge' | 'delete' | 'update';

export interface ActionLogEntry {
  id: string;
  actionType: ActionType;
  entityName: string;
  entityType?: string;
  timestamp: number;
  details?: string;
}

interface ActionLogState {
  entries: ActionLogEntry[];
  isOpen: boolean;
  addEntry: (entry: Omit<ActionLogEntry, 'id' | 'timestamp'>) => void;
  clearLog: () => void;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
}

export const useActionLogStore = create<ActionLogState>()((set) => ({
  entries: [],
  isOpen: false,

  addEntry: (entry) =>
    set((state) => ({
      entries: [
        {
          ...entry,
          id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          timestamp: Date.now(),
        },
        ...state.entries,
      ],
    })),

  clearLog: () => set({ entries: [] }),

  setOpen: (open) => set({ isOpen: open }),

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
}));
