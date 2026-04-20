'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type EntityTypeConfig = {
  key: string;
  label: string;
  color: string;
};

type EntityTypeState = {
  types: Record<string, EntityTypeConfig>;
  getType: (key?: string | null) => EntityTypeConfig;
  upsertType: (type: EntityTypeConfig) => void;
  ensureType: (key?: string | null) => EntityTypeConfig;
};

const normalizeTypeKey = (value?: string | null) =>
  value?.trim().toLowerCase().replace(/\s+/g, '_') || 'unknown';

const defaultTypes: Record<string, EntityTypeConfig> = {
  person: {
    key: 'person',
    label: 'Person',
    color: '#3b82f6',
  },
  place: {
    key: 'place',
    label: 'Place',
    color: '#10b981',
  },
  action: {
    key: 'action',
    label: 'Action',
    color: '#f43f5e',
  },
  topic: {
    key: 'topic',
    label: 'Topic',
    color: '#8b5cf6',
  },
  event: {
    key: 'event',
    label: 'Event',
    color: '#f97316',
  },
  unknown: {
    key: 'unknown',
    label: 'Unknown',
    color: '#94a3b8',
  },
};

export const useEntityTypeStore = create<EntityTypeState>()(
  persist(
    (set, get) => ({
      types: defaultTypes,

      getType: (key) => {
        const normalizedKey = normalizeTypeKey(key);
        return get().types[normalizedKey] || {
          key: normalizedKey,
          label: normalizedKey.replace(/_/g, ' '),
          color: '#94a3b8',
        };
      },

      ensureType: (key) => {
        const normalizedKey = normalizeTypeKey(key);
        const existing = get().types[normalizedKey];

        if (existing) return existing;

        const created = {
          key: normalizedKey,
          label: normalizedKey.replace(/_/g, ' '),
          color: '#94a3b8',
        };

        set((state) => ({
          types: {
            ...state.types,
            [normalizedKey]: created,
          },
        }));

        return created;
      },

      upsertType: (type) => {
        const normalizedKey = normalizeTypeKey(type.key);

        set((state) => ({
          types: {
            ...state.types,
            [normalizedKey]: {
              key: normalizedKey,
              label: type.label.trim() || normalizedKey,
              color: type.color || '#94a3b8',
            },
          },
        }));
      },
    }),
    {
      name: 'mujarrad-entity-types',
    }
  )
);