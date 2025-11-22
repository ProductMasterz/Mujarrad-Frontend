/**
 * Whiteboard Zustand Store
 * Generated with assistance from ollama:llama3.1:8b
 */

import { create } from 'zustand';
import {
  ExcalidrawElement,
  WhiteboardAppState,
  BinaryFileData,
  WhiteboardStore,
} from '@/types/whiteboard';

const initialState = {
  elements: [] as ExcalidrawElement[],
  appState: {} as Partial<WhiteboardAppState>,
  files: {} as Record<string, BinaryFileData>,
  isDirty: false,
  isSaving: false,
  lastSaved: null as Date | null,
  error: null as string | null,
};

export const useWhiteboardStore = create<WhiteboardStore>((set) => ({
  ...initialState,

  setElements: (elements: ExcalidrawElement[]) =>
    set({ elements, isDirty: true }),

  setAppState: (appState: Partial<WhiteboardAppState>) =>
    set({ appState }),

  setFiles: (files: Record<string, BinaryFileData>) =>
    set({ files }),

  markDirty: () =>
    set({ isDirty: true }),

  markSaved: () =>
    set({ isDirty: false, lastSaved: new Date() }),

  setSaving: (isSaving: boolean) =>
    set({ isSaving }),

  setError: (error: string | null) =>
    set({ error }),

  reset: () =>
    set(initialState),
}));

export default useWhiteboardStore;
