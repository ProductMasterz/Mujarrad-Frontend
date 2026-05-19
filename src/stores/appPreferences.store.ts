'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DefaultHomePage = 'home' | 'spaces' | 'settings' | 'profile';
export type UiDensity = 'comfortable' | 'compact';
export type TimeFormat = '12h' | '24h';
export type LanguagePreference = 'en' | 'ar' | 'de';

export type AppPreferences = {
  language: LanguagePreference;
  timeFormat: TimeFormat;
  defaultHomePage: DefaultHomePage;
  uiDensity: UiDensity;
  reduceMotion: boolean;
  openChatHistoryByDefault: boolean;
  sendMessageOnEnter: boolean;
  showChatTimestamps: boolean;
  renderMarkdownInGraph: boolean;
  showTechnicalDetailsByDefault: boolean;
  showChatNodesInGraph: boolean;
};

type AppPreferencesState = {
  preferences: AppPreferences;
  updatePreferences: (patch: Partial<AppPreferences>) => void;
  resetPreferences: () => void;
};

export const defaultAppPreferences: AppPreferences = {
  language: 'en',
  timeFormat: '24h',
  defaultHomePage: 'home',
  uiDensity: 'comfortable',
  reduceMotion: false,
  openChatHistoryByDefault: true,
  sendMessageOnEnter: false,
  showChatTimestamps: true,
  renderMarkdownInGraph: true,
  showTechnicalDetailsByDefault: false,
  showChatNodesInGraph: true,
};

export const useAppPreferencesStore = create<AppPreferencesState>()(
  persist(
    (set) => ({
      preferences: defaultAppPreferences,

      updatePreferences: (patch) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...patch,
          },
        })),

      resetPreferences: () =>
        set({
          preferences: defaultAppPreferences,
        }),
    }),
    {
      name: 'mujarrad-app-preferences',
      partialize: (state) => ({
        preferences: state.preferences,
      }),
    }
  )
);