import { create } from 'zustand';

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

interface Layer1StoreState {
  graphState: Layer1GraphState;

  syncFromGraphState: (graphState: Layer1GraphState) => void;
  resetRun: () => void;

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

export const useLayer1Store = create<Layer1StoreState>((set) => ({
  graphState: createInitialLayer1GraphState(),

  syncFromGraphState: (graphState) => set({ graphState }),

  resetRun: () => set({ graphState: createInitialLayer1GraphState() }),

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
}));
