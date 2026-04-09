'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType =
  | 'success'
  | 'info'
  | 'warning'
  | 'error';

export type NotificationSource =
  | 'system'
  | 'chat'
  | 'node'
  | 'space';

export type NotificationItem = {
  id: string;
  title: string;
  description?: string;
  type: NotificationType;
  source?: NotificationSource;
  createdAt: string;
  read: boolean;
};

export type NotificationSettings = {
  enabled: boolean;
  showUnreadBadge: boolean;
  playSound: boolean;
  notifyChatActivity: boolean;
  notifyNodeChanges: boolean;
  notifySpaceChanges: boolean;
  allowSuccess: boolean;
  allowInfo: boolean;
  allowWarning: boolean;
  allowError: boolean;
};

type AddNotificationInput = Omit<NotificationItem, 'id' | 'createdAt' | 'read'>;

type NotificationState = {
  notifications: NotificationItem[];
  settings: NotificationSettings;

  addNotification: (item: AddNotificationInput) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  updateSettings: (patch: Partial<NotificationSettings>) => void;
  resetSettings: () => void;
};

const defaultSettings: NotificationSettings = {
  enabled: true,
  showUnreadBadge: true,
  playSound: false,
  notifyChatActivity: true,
  notifyNodeChanges: true,
  notifySpaceChanges: true,
  allowSuccess: true,
  allowInfo: true,
  allowWarning: true,
  allowError: true,
};

function isTypeAllowed(
  type: NotificationType,
  settings: NotificationSettings
) {
  if (type === 'success') return settings.allowSuccess;
  if (type === 'info') return settings.allowInfo;
  if (type === 'warning') return settings.allowWarning;
  if (type === 'error') return settings.allowError;
  return true;
}

function isSourceAllowed(
  source: NotificationSource | undefined,
  settings: NotificationSettings
) {
  if (!source || source === 'system') return true;
  if (source === 'chat') return settings.notifyChatActivity;
  if (source === 'node') return settings.notifyNodeChanges;
  if (source === 'space') return settings.notifySpaceChanges;
  return true;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      settings: defaultSettings,

      addNotification: (item) => {
        const { settings } = get();

        if (!settings.enabled) return;
        if (!isTypeAllowed(item.type, settings)) return;
        if (!isSourceAllowed(item.source, settings)) return;

        set((state) => ({
          notifications: [
            {
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              read: false,
              ...item,
            },
            ...state.notifications,
          ],
        }));

        if (settings.playSound && typeof window !== 'undefined') {
          try {
            const audio = new Audio('/sounds/notification.mp3');
            void audio.play();
          } catch {
            // ignore sound playback failures
          }
        }
      },

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            read: true,
          })),
        })),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearNotifications: () => set({ notifications: [] }),

      updateSettings: (patch) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...patch,
          },
        })),

      resetSettings: () =>
        set({
          settings: defaultSettings,
        }),
    }),
    {
      name: 'mujarrad-notifications',
      partialize: (state) => ({
        notifications: state.notifications,
        settings: state.settings,
      }),
    }
  )
);