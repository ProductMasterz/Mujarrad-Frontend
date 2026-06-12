import type {
  ProcessedInputContext,
  RawInputPayload,
  TextChunk,
} from './input.types';

export type Layer1StepId =
  | 'input'
  | 'clarification'
  | 'specification'
  | 'diagram'
  | 'review'
  | 'export';

export type Layer1Stage =
  | 'input'
  | 'input_processing'
  | 'clarification'
  | 'understanding'
  | 'specification'
  | 'diagram'
  | 'diagram_review'
  | 'export'
  | 'approved_layer1_artifact_bundle';

export type QuestionCategory =
  | 'goal'
  | 'users'
  | 'roles_permissions'
  | 'workflow'
  | 'alternative_workflows'
  | 'inputs'
  | 'outputs'
  | 'entities'
  | 'business_rules'
  | 'decision_logic'
  | 'validations'
  | 'edge_cases'
  | 'error_handling'
  | 'integrations'
  | 'security'
  | 'notifications'
  | 'reporting'
  | 'layer1_artifact_preparation';

export interface ConstructiveQuestion {
  id: string;
  question: string;
  category: QuestionCategory;
  reasonForAsking: string;
  basedOn: {
    processedInputId?: string;
    chunkIds?: string[];
    previousQuestionIds?: string[];
    previousAnswerIds?: string[];
    understandingFields?: string[];
    missingCategories?: string[];
  };
  expectedAnswerType:
    | 'short_text'
    | 'long_text'
    | 'list'
    | 'yes_no'
    | 'choice'
    | 'number'
    | 'structured';
  options?: string[];
  createdAt: string;
  answeredAt?: string;
  answer?: string;
  skipped?: boolean;
}

export interface QuestionAnswer {
  id: string;
  questionId: string;
  answer: string;
  createdAt: string;
}

export interface WorkflowDescription {
  id: string;
  title: string;
  steps: string[];
}

export interface SystemInput {
  id: string;
  name: string;
  description?: string;
}

export interface SystemOutput {
  id: string;
  name: string;
  description?: string;
}

export interface SystemEntity {
  id: string;
  name: string;
  attributes: string[];
}

export interface BusinessRule {
  id: string;
  rule: string;
}

export interface DecisionRule {
  id: string;
  condition: string;
  outcome: string;
}

export interface ValidationRule {
  id: string;
  field: string;
  rule: string;
}

export interface EdgeCase {
  id: string;
  case: string;
}

export interface ErrorCase {
  id: string;
  error: string;
  handling: string;
}

export interface IntegrationPoint {
  id: string;
  name: string;
  purpose: string;
}

export interface NotificationRule {
  id: string;
  trigger: string;
  message: string;
}

export interface ReportingRequirement {
  id: string;
  report: string;
  audience?: string;
}

export interface SecurityRequirement {
  id: string;
  requirement: string;
}

export interface SystemUnderstanding {
  summary: string;
  goal: string;
  primaryUsers: string[];
  secondaryUsers: string[];
  roles: string[];
  permissions: string[];
  workflows: WorkflowDescription[];
  alternativeWorkflows: WorkflowDescription[];
  inputs: SystemInput[];
  outputs: SystemOutput[];
  entities: SystemEntity[];
  businessRules: BusinessRule[];
  decisionLogic: DecisionRule[];
  validationRules: ValidationRule[];
  edgeCases: EdgeCase[];
  errorCases: ErrorCase[];
  integrations: IntegrationPoint[];
  notifications: NotificationRule[];
  reporting: ReportingRequirement[];
  security: SecurityRequirement[];
  openQuestions: string[];
  assumptions: string[];
  confidence: number;
}

export type CompletenessStatus =
  | 'complete'
  | 'weak'
  | 'missing'
  | 'not_applicable';

export interface CompletenessCategoryStatus {
  category: QuestionCategory;
  status: CompletenessStatus;
  score: number;
  notes: string;
}

export interface CompletenessReport {
  overallScore: number;
  readyForSpec: boolean;
  readyForDiagram: boolean;
  categories: CompletenessCategoryStatus[];
  missingCriticalItems: string[];
  weakItems: string[];
  suggestedNextQuestionCategory?: QuestionCategory;
}

export interface DiagramRevision {
  id: string;
  xml: string;
  instruction?: string;
  createdAt: string;
}

export interface Layer1ArtifactBundle {
  markdownSpec: string;
  drawioXml: string;
  diagramImage?: {
    format: 'png' | 'svg';
    dataUrl?: string;
    fileName?: string;
  };
  diagramSummary?: string;
  approvedAt: string;
}

export interface Layer1Error {
  id: string;
  message: string;
  createdAt: string;
  source?: string;
}

export interface Layer1Run {
  id: string;
  runId: string;
  createdAt: string;
  updatedAt: string;
  stage: Layer1Stage;

  activeStep: Layer1StepId;
  completedSteps: Layer1StepId[];
  availableSteps: Layer1StepId[];

  rawInputs: RawInputPayload[];
  processedInput: ProcessedInputContext | null;

  currentQuestion: ConstructiveQuestion | null;
  questions: ConstructiveQuestion[];
  qaHistory: QuestionAnswer[];

  understanding: SystemUnderstanding;
  completeness: CompletenessReport | null;

  markdownSpec: string;
  markdownApproved: boolean;

  drawioXml: string;
  diagramImage?: {
    format: 'png' | 'svg';
    dataUrl?: string;
    fileName?: string;
  };
  diagramSummary: string;
  diagramApproved: boolean;
  diagramRevisions: DiagramRevision[];

  approvedLayer1Artifacts?: Layer1ArtifactBundle;

  errors: Layer1Error[];
}

export interface Layer1InternalStateForFutureUse {
  runId: string;
  rawInputs: RawInputPayload[];
  processedInput: ProcessedInputContext;
  qaHistory: QuestionAnswer[];
  systemUnderstanding: SystemUnderstanding;
  completenessReport: CompletenessReport;
  approvedArtifacts: Layer1ArtifactBundle;
  traceability: {
    questions: ConstructiveQuestion[];
    textChunks: TextChunk[];
    diagramRevisions: DiagramRevision[];
  };
  readyForLayer2: boolean;
  createdAt: string;
}

export function createEmptySystemUnderstanding(): SystemUnderstanding {
  return {
    summary: '',
    goal: '',
    primaryUsers: [],
    secondaryUsers: [],
    roles: [],
    permissions: [],
    workflows: [],
    alternativeWorkflows: [],
    inputs: [],
    outputs: [],
    entities: [],
    businessRules: [],
    decisionLogic: [],
    validationRules: [],
    edgeCases: [],
    errorCases: [],
    integrations: [],
    notifications: [],
    reporting: [],
    security: [],
    openQuestions: [],
    assumptions: [],
    confidence: 0,
  };
}
