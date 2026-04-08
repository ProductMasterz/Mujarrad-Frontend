'use client';

import { create } from 'zustand';

export type NotificationType =
  | 'success'
  | 'info'
  | 'warning'
  | 'error';

export type NotificationItem = {
  id: string;
  title: string;
  description?: string;
  type: NotificationType;
  createdAt: string;
  read: boolean;
};

type NotificationState = {
  notifications: NotificationItem[];
  addNotification: (item: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  addNotification: (item) =>
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
    })),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearNotifications: () => set({ notifications: [] }),
}));