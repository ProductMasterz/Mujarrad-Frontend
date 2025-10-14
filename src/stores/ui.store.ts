'use client';

// src/stores/ui.store.ts

import { create } from 'zustand';

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Modals
  createNodeModalOpen: boolean;
  setCreateNodeModalOpen: (open: boolean) => void;

  createSpaceModalOpen: boolean;
  setCreateSpaceModalOpen: (open: boolean) => void;

  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Loading states
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Modals
  createNodeModalOpen: false,
  setCreateNodeModalOpen: (open) => set({ createNodeModalOpen: open }),

  createSpaceModalOpen: false,
  setCreateSpaceModalOpen: (open) => set({ createSpaceModalOpen: open }),

  // Theme
  theme: 'system',
  setTheme: (theme) => set({ theme }),

  // Loading
  globalLoading: false,
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
}));
