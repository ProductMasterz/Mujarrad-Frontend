import type { InputProcessingResult, RawInputPayload } from './input.types';
import type {
  Layer1DiagramImages,
  Layer1Run,
  Layer1Stage,
  Layer1StepId,
} from './layer1.types';

export type Layer1GraphNextAction =
  | 'process_input'
  | 'ask_question'
  | 'wait_for_answer'
  | 'update_understanding'
  | 'check_completeness'
  | 'generate_diagram'
  | 'wait_for_diagram_approval'
  | 'refine_diagram'
  | 'generate_final_docs'
  | 'wait_for_final_docs_review'
  | 'create_artifact_bundle'
  | 'complete'
  | 'error';

export type Layer1GraphEventType =
  | 'start_run'
  | 'submit_input'
  | 'submit_answer'
  | 'generate_question'
  | 'skip_to_diagram'
  | 'generate_diagram'
  | 'refine_diagram'
  | 'sync_diagram_xml'
  | 'undo_diagram_revision'
  | 'reset_diagram_revision'
  | 'approve_diagram'
  | 'generate_final_docs'
  | 'complete_step'
  | 'sync_state'
  | 'reset_run';

export interface Layer1GraphEvent {
  type: Layer1GraphEventType;
  rawInput?: RawInputPayload;
  answer?: string;
  stepId?: Layer1StepId;
  refinementInstruction?: string;
  xml?: string;
  diagramImages?: Layer1DiagramImages;
}

export interface Layer1GraphState extends Layer1Run {
  nextAction: Layer1GraphNextAction;
}

export interface Layer1GraphResult {
  ok: boolean;
  state: Layer1GraphState;
  processingResult?: InputProcessingResult;
  message?: string;
}

export interface Layer1GraphResumeInput {
  runId: string;
  event: Layer1GraphEvent;
}

export interface Layer1GraphError {
  message: string;
  source: string;
}

export interface Layer1StepState {
  stage: Layer1Stage;
  activeStep: Layer1StepId;
  completedSteps: Layer1StepId[];
  availableSteps: Layer1StepId[];
}
