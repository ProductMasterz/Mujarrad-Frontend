import { create } from 'zustand';
import type { StateStorage } from 'zustand/middleware';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createInitialLayer1GraphState } from '../graphs/layer1GraphState';
import type { Layer1GraphState } from '../types/graph.types';
import type { ProcessedInputContext, RawInputPayload } from '../types/input.types';
import type {
  CompletenessReport,
  ConstructiveQuestion,
  DiagramRevision,
  Layer1ArtifactBundle,
  Layer1Stage,
  Layer1StepId,
  QuestionAnswer,
  SystemUnderstanding,
} from '../types/layer1.types';

export interface Layer1HistoryEntry {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  state: Layer1GraphState;
}

function deriveRunTitle(graphState: Layer1GraphState): string {
  const source =
    graphState.rawInputs[0]?.rawText?.trim() ||
    graphState.processedInput?.normalizedText?.trim() ||
    graphState.understanding.summary?.trim() ||
    '';

  if (!source) {
    return 'Untitled design';
  }

  const firstLine = source.split('\n')[0].trim();
  return firstLine.length > 60 ? `${firstLine.slice(0, 57)}…` : firstLine;
}

function hasStarted(graphState: Layer1GraphState): boolean {
  return graphState.rawInputs.length > 0 || Boolean(graphState.processedInput);
}

function upsertHistory(
  history: Layer1HistoryEntry[],
  graphState: Layer1GraphState,
): Layer1HistoryEntry[] {
  if (!hasStarted(graphState)) {
    return history;
  }

  const id = graphState.runId || graphState.id;
  const entry: Layer1HistoryEntry = {
    id,
    title: deriveRunTitle(graphState),
    createdAt: graphState.createdAt,
    updatedAt: graphState.updatedAt || new Date().toISOString(),
    state: graphState,
  };

  const existingIndex = history.findIndex((item) => item.id === id);

  if (existingIndex >= 0) {
    const next = history.slice();
    next[existingIndex] = entry;
    return next;
  }

  return [entry, ...history];
}

interface Layer1StoreState {
  graphState: Layer1GraphState;
  history: Layer1HistoryEntry[];
  hasHydrated: boolean;

  setHasHydrated: (hasHydrated: boolean) => void;
  syncFromGraphState: (graphState: Layer1GraphState) => void;
  resetRun: () => void;

  startNewRun: () => void;
  loadRun: (id: string) => void;
  deleteRun: (id: string) => void;

  submitRawInput: (rawInput: RawInputPayload) => void;
  setProcessedInput: (processedInput: ProcessedInputContext | null) => void;
  setStage: (stage: Layer1Stage) => void;

  setActiveStep: (stepId: Layer1StepId) => void;
  setCompletedSteps: (stepIds: Layer1StepId[]) => void;
  setAvailableSteps: (stepIds: Layer1StepId[]) => void;

  setCurrentQuestion: (question: ConstructiveQuestion | null) => void;
  submitAnswer: (answer: QuestionAnswer) => void;
  updateUnderstanding: (understanding: SystemUnderstanding) => void;
  setCompleteness: (completeness: CompletenessReport | null) => void;

  setMarkdownSpec: (markdownSpec: string) => void;
  approveMarkdownSpec: () => void;

  setDrawioXml: (drawioXml: string) => void;
  setDiagramImage: (diagramImage: Layer1GraphState['diagramImage']) => void;
  addDiagramRevision: (revision: DiagramRevision) => void;
  approveDiagram: () => void;

  createLayer1ArtifactBundle: (bundle: Layer1ArtifactBundle) => void;
}

const baseStorageName = 'mujarrad-system-builder-layer1-state-v1';
const authStorageName = 'auth-storage';

function getInitialState(): Layer1GraphState {
  return createInitialLayer1GraphState();
}

function getCurrentAuthUserKey(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(authStorageName);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as {
      state?: {
        user?: {
          id?: string;
          userId?: string;
          email?: string;
          username?: string;
        } | null;
        token?: string | null;
      };
    };

    const user = parsed.state?.user;
    const token = parsed.state?.token;

    if (!user || !token) {
      return null;
    }

    return user.id || user.userId || user.email || user.username || null;
  } catch {
    return null;
  }
}

function getScopedStorageName(): string {
  const userKey = getCurrentAuthUserKey();

  if (!userKey) {
    return `${baseStorageName}:anonymous`;
  }

  return `${baseStorageName}:${userKey}`;
}

export function clearAllLayer1LocalRuns() {
  if (typeof window === 'undefined') {
    return;
  }

  Object.keys(window.localStorage).forEach((key) => {
    if (key === baseStorageName || key.startsWith(`${baseStorageName}:`)) {
      window.localStorage.removeItem(key);
    }
  });
}

export function clearCurrentLayer1LocalRun() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(getScopedStorageName());
}

const scopedLayer1Storage: StateStorage = {
  getItem: () => {
    if (typeof window === 'undefined') {
      return null;
    }

    window.localStorage.removeItem(baseStorageName);
    window.localStorage.removeItem(`${baseStorageName}:anonymous`);

    return window.localStorage.getItem(getScopedStorageName());
  },
  setItem: (_name, value) => {
    if (typeof window === 'undefined') {
      return;
    }

    const userKey = getCurrentAuthUserKey();

    if (!userKey) {
      return;
    }

    window.localStorage.setItem(getScopedStorageName(), value);
  },
  removeItem: () => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(getScopedStorageName());
  },
};

export const useLayer1Store = create<Layer1StoreState>()(
  persist(
    (set) => ({
      graphState: getInitialState(),
      history: [],
      hasHydrated: false,

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      syncFromGraphState: (graphState) =>
        set((state) => ({
          graphState,
          history: upsertHistory(state.history, graphState),
        })),

      resetRun: () => {
        clearCurrentLayer1LocalRun();
        set({ graphState: getInitialState(), history: [] });
      },

      startNewRun: () =>
        set((state) => ({
          // The current run is already mirrored in history via syncFromGraphState.
          graphState: getInitialState(),
          history: upsertHistory(state.history, state.graphState),
        })),

      loadRun: (id) =>
        set((state) => {
          const entry = state.history.find((item) => item.id === id);
          if (!entry) {
            return {};
          }
          return {
            // Snapshot the live run into history before switching away.
            history: upsertHistory(state.history, state.graphState),
            graphState: entry.state,
          };
        }),

      deleteRun: (id) =>
        set((state) => {
          const history = state.history.filter((item) => item.id !== id);
          const activeId = state.graphState.runId || state.graphState.id;
          return {
            history,
            graphState:
              activeId === id ? getInitialState() : state.graphState,
          };
        }),

      submitRawInput: (rawInput) =>
        set((state) => ({
          graphState: {
            ...state.graphState,
            rawInputs: [...state.graphState.rawInputs, rawInput],
          },
        })),

      setProcessedInput: (processedInput) =>
        set((state) => ({
          graphState: {
            ...state.graphState,
            processedInput,
          },
        })),

      setStage: (stage) =>
        set((state) => ({
          graphState: {
            ...state.graphState,
            stage,
          },
        })),

      setActiveStep: (activeStep) =>
        set((state) => ({
          graphState: {
            ...state.graphState,
            activeStep,
          },
        })),

      setCompletedSteps: (completedSteps) =>
        set((state) => ({
          graphState: {
            ...state.graphState,
            completedSteps,
          },
        })),

      setAvailableSteps: (availableSteps) =>
        set((state) => ({
          graphState: {
            ...state.graphState,
            availableSteps,
          },
        })),

      setCurrentQuestion: (question) =>
        set((state) => ({
          graphState: {
            ...state.graphState,
            currentQuestion: question,
            questions: question
              ? [...state.graphState.questions, question]
              : state.graphState.questions,
          },
        })),

      submitAnswer: (answer) =>
        set((state) => ({
          graphState: {
            ...state.graphState,
            qaHistory: [...state.graphState.qaHistory, answer],
          },
        })),

      updateUnderstanding: (understanding) =>
        set((state) => ({
          graphState: {
            ...state.graphState,
            understanding,
          },
        })),

      setCompleteness: (completeness) =>
        set((state) => ({
          graphState: {
            ...state.graphState,
            completeness,
          },
        })),

      setMarkdownSpec: (markdownSpec) =>
        set((state) => ({
          graphState: {
            ...state.graphState,
            markdownSpec,
          },
        })),

      approveMarkdownSpec: () =>
        set((state) => ({
          graphState: {
            ...state.graphState,
            markdownApproved: true,
          },
        })),

      setDrawioXml: (drawioXml) =>
        set((state) => ({
          graphState: {
            ...state.graphState,
            drawioXml,
          },
        })),

      setDiagramImage: (diagramImage) =>
        set((state) => ({
          graphState: {
            ...state.graphState,
            diagramImage,
          },
        })),

      addDiagramRevision: (revision) =>
        set((state) => ({
          graphState: {
            ...state.graphState,
            diagramRevisions: [...state.graphState.diagramRevisions, revision],
          },
        })),

      approveDiagram: () =>
        set((state) => ({
          graphState: {
            ...state.graphState,
            diagramApproved: true,
          },
        })),

      createLayer1ArtifactBundle: (bundle) =>
        set((state) => ({
          graphState: {
            ...state.graphState,
            approvedLayer1Artifacts: bundle,
          },
        })),
    }),
    {
      name: baseStorageName,
      version: 1,
      storage: createJSONStorage(() => scopedLayer1Storage),
      partialize: (state) => ({
        graphState: state.graphState,
        history: state.history,
      }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
