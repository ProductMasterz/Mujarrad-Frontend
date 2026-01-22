/**
 * Whiteboard Zustand Store
 * Generated with assistance from ollama:llama3.1:8b
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ExcalidrawElement,
  WhiteboardAppState,
  BinaryFileData,
  WhiteboardStore,
  SyncStatus,
} from '@/types/whiteboard';

const STORAGE_KEY = 'whiteboard-sync-maps';

const initialState = {
  elements: [] as ExcalidrawElement[],
  appState: {} as Partial<WhiteboardAppState>,
  files: {} as Record<string, BinaryFileData>,
  isDirty: false,
  isSaving: false,
  lastSaved: null as Date | null,
  error: null as string | null,
  // Sync state
  syncStatus: 'idle' as SyncStatus,
  lastSyncError: null as string | null,
  lastSyncTime: null as Date | null,
  nodeFrameMap: new Map<string, string>(),
  frameNodeMap: new Map<string, string>(),
};

export const useWhiteboardStore = create<WhiteboardStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setElements: (elements: ExcalidrawElement[]) =>
        set({ elements, isDirty: true }),

      setAppState: (appState: Partial<WhiteboardAppState>) => set({ appState }),

      setFiles: (files: Record<string, BinaryFileData>) => set({ files }),

      markDirty: () => set({ isDirty: true }),

      markSaved: () => set({ isDirty: false, lastSaved: new Date() }),

      setSaving: (isSaving: boolean) => set({ isSaving }),

      setError: (error: string | null) => set({ error }),

      reset: () =>
        set({
          ...initialState,
          // Preserve sync maps on reset
          nodeFrameMap: get().nodeFrameMap,
          frameNodeMap: get().frameNodeMap,
        }),

      // Sync actions
      setSyncStatus: (status: SyncStatus) =>
        set({
          syncStatus: status,
          lastSyncTime: status === 'idle' ? new Date() : get().lastSyncTime,
        }),

      setSyncError: (error: string | null) =>
        set({
          lastSyncError: error,
          syncStatus: error ? 'error' : get().syncStatus,
        }),

      updateNodeFrameMap: (nodeId: string, frameId: string) => {
        const nodeFrameMap = new Map(get().nodeFrameMap);
        const frameNodeMap = new Map(get().frameNodeMap);
        nodeFrameMap.set(nodeId, frameId);
        frameNodeMap.set(frameId, nodeId);
        set({ nodeFrameMap, frameNodeMap });
      },

      removeNodeFrameMapping: (nodeId: string) => {
        const nodeFrameMap = new Map(get().nodeFrameMap);
        const frameNodeMap = new Map(get().frameNodeMap);
        const frameId = nodeFrameMap.get(nodeId);
        if (frameId) {
          frameNodeMap.delete(frameId);
        }
        nodeFrameMap.delete(nodeId);
        set({ nodeFrameMap, frameNodeMap });
      },

      setNodeFrameMaps: (
        nodeFrameMap: Map<string, string>,
        frameNodeMap: Map<string, string>
      ) => set({ nodeFrameMap, frameNodeMap }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        // Only persist sync maps, not UI state
        nodeFrameMap: state.nodeFrameMap,
        frameNodeMap: state.frameNodeMap,
      }),
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          try {
            const parsed = JSON.parse(str);
            return {
              state: {
                nodeFrameMap: new Map(
                  Object.entries(parsed.state?.nodeFrameMap || {})
                ),
                frameNodeMap: new Map(
                  Object.entries(parsed.state?.frameNodeMap || {})
                ),
              },
            };
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          const toStore = {
            state: {
              nodeFrameMap: Object.fromEntries(value.state.nodeFrameMap || []),
              frameNodeMap: Object.fromEntries(value.state.frameNodeMap || []),
            },
          };
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

export default useWhiteboardStore;
