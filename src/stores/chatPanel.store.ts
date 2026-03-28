'use client';

import { create } from 'zustand';

type ChatPanelState = {
  isOpen: boolean;
  spaceSlug: string | null;
  openChat: (spaceSlug?: string) => void;
  closeChat: () => void;
};

export const useChatPanelStore = create<ChatPanelState>((set) => ({
  isOpen: false,
  spaceSlug: null,
  openChat: (spaceSlug) => {
    set((state) => ({
      isOpen: true,
      spaceSlug: spaceSlug || state.spaceSlug,
    }));
  },
  closeChat: () => {
    set({ isOpen: false });
  },
}));
