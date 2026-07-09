export type DiagramIntelligenceMode =
  | 'create'
  | 'modify';

export type DiagramPipelineDepth =
  | 'fast_edit'
  | 'advanced_modification'
  | 'expert_reconstruction';

export type DiagramOperation =
  | 'rename'
  | 'move'
  | 'connect'
  | 'disconnect'
  | 'add_element'
  | 'remove_element'
  | 'style_change'
  | 'layout_improvement'
  | 'semantic_enrichment'
  | 'structural_refactor'
  | 'architecture_improvement'
  | 'architecture_transformation'
  | 'diagram_type_conversion'
  | 'audience_transformation'
  | 'simplification'
  | 'expansion'
  | 'full_reconstruction';

export type DiagramScope =
  | 'single_element'
  | 'selected_region'
  | 'subsystem'
  | 'whole_diagram'
  | 'whole_system';

export type DiagramType =
  | 'auto'
  | 'generic'
  | 'flowchart'
  | 'system_architecture'
  | 'software_architecture'
  | 'solution_architecture'
  | 'cloud_architecture'
  | 'infrastructure_architecture'
  | 'network_architecture'
  | 'security_architecture'
  | 'integration_architecture'
  | 'data_flow'
  | 'data_pipeline'
  | 'event_driven_topology'
  | 'ai_ml_pipeline'
  | 'rag_architecture'
  | 'agent_architecture'
  | 'c4_context'
  | 'c4_container'
  | 'c4_component'
  | 'uml_activity'
  | 'uml_sequence'
  | 'uml_component'
  | 'uml_deployment'
  | 'uml_class'
  | 'uml_state_machine'
  | 'entity_relationship'
  | 'business_process'
  | 'swimlane';

export type DiagramAudience =
  | 'auto'
  | 'executive'
  | 'product'
  | 'business'
  | 'software_architect'
  | 'backend_engineer'
  | 'frontend_engineer'
  | 'devops_engineer'
  | 'security_engineer'
  | 'data_engineer'
  | 'ai_engineer'
  | 'database_engineer'
  | 'mixed_technical';

export type DiagramGoal =
  | 'preserve_meaning'
  | 'improve_architecture'
  | 'improve_readability'
  | 'improve_completeness'
  | 'improve_security'
  | 'improve_resilience'
  | 'improve_scalability'
  | 'improve_observability'
  | 'improve_data_flow'
  | 'improve_deployment'
  | 'reduce_complexity'
  | 'increase_technical_detail'
  | 'change_representation'
  | 'change_audience';

export type DiagramPreservationPolicy =
  | 'strict'
  | 'preserve_business_meaning'
  | 'preserve_core_architecture'
  | 'architectural_changes_allowed'
  | 'full_redesign_allowed';

export interface DiagramRefinementIntent {
  pipelineDepth: DiagramPipelineDepth;

  operation: DiagramOperation;

  scope: DiagramScope;

  targetDiagramType: DiagramType;

  audience: DiagramAudience;

  goals: DiagramGoal[];

  preservationPolicy: DiagramPreservationPolicy;

  requiresSystemContext: boolean;

  requiresCurrentDiagramAnalysis: boolean;

  requiresArchitectureReasoning: boolean;

  requiresRepresentationExpert: boolean;

  requiresLayoutPlanning: boolean;

  requiresCriticReview: boolean;

  requiresRepairLoop: boolean;

  userGoal: string;

  confidence: number;

  rationale: string;
}

export interface DiagramElementAnalysis {
  id: string;

  label: string;

  semanticType: string;

  parentId?: string;

  x?: number;

  y?: number;

  width?: number;

  height?: number;

  important: boolean;
}

export interface DiagramRelationshipAnalysis {
  id: string;

  sourceId: string;

  targetId: string;

  label?: string;

  semanticType: string;
}

export interface CurrentDiagramAnalysis {
  detectedDiagramType: DiagramType;

  title?: string;

  elements: DiagramElementAnalysis[];

  relationships: DiagramRelationshipAnalysis[];

  groups: string[];

  boundaries: string[];

  majorFlows: string[];

  semanticConcepts: string[];

  strengths: string[];

  structuralProblems: string[];

  architectureProblems: string[];

  visualProblems: string[];

  missingConcepts: string[];

  summary: string;
}

export interface DiagramContextSelection {
  selectedUnderstandingFields: string[];

  relevantWorkflows: string[];

  relevantBusinessRules: string[];

  relevantDecisionLogic: string[];

  relevantIntegrations: string[];

  relevantSecurityRequirements: string[];

  relevantErrorCases: string[];

  relevantEdgeCases: string[];

  relevantEntities: string[];

  relevantAssumptions: string[];

  contextSummary: string;
}

export interface DiagramTransformationStep {
  id: string;

  action:
    | 'preserve'
    | 'add'
    | 'remove'
    | 'transform'
    | 'reconnect'
    | 'regroup'
    | 'relayout'
    | 'annotate';

  target: string;

  reason: string;

  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface DiagramTransformationPlan {
  sourceDiagramType: DiagramType;

  targetDiagramType: DiagramType;

  strategy: string;

  preserve: string[];

  remove: string[];

  add: string[];

  steps: DiagramTransformationStep[];

  requiredElements: string[];

  requiredRelationships: string[];

  architectureDecisions: string[];

  layoutStrategy: string;

  validationCriteria: string[];

  risks: string[];

  assumptions: string[];
}

export interface SemanticDiagramNode {
  id: string;

  type: string;

  label: string;

  description?: string;

  groupId?: string;

  laneId?: string;

  importance:
    | 'primary'
    | 'secondary'
    | 'supporting';

  metadata?: Record<string, string | number | boolean>;
}

export interface SemanticDiagramEdge {
  id: string;

  sourceId: string;

  targetId: string;

  type: string;

  label?: string;

  direction:
    | 'forward'
    | 'backward'
    | 'bidirectional';

  metadata?: Record<string, string | number | boolean>;
}

export interface SemanticDiagramGroup {
  id: string;

  label: string;

  type: string;

  parentId?: string;
}

export interface SemanticDiagramLane {
  id: string;

  label: string;

  order: number;
}

export interface SemanticDiagramBoundary {
  id: string;

  label: string;

  type:
    | 'system'
    | 'security'
    | 'deployment'
    | 'network'
    | 'domain'
    | 'data';

  memberIds: string[];
}

export interface DiagramLayoutIntent {
  direction:
    | 'left_to_right'
    | 'top_to_bottom'
    | 'radial'
    | 'timeline'
    | 'swimlane';

  hierarchyLevels: string[];

  groupOrder: string[];

  minimizeCrossings: boolean;

  emphasizePrimaryFlow: boolean;

  density:
    | 'compact'
    | 'balanced'
    | 'spacious';

  edgeRouting:
    | 'orthogonal'
    | 'curved'
    | 'direct';

  notes: string[];
}

export interface SemanticDiagramModel {
  version: '1.0';

  diagramType: DiagramType;

  title: string;

  purpose: string;

  audience: DiagramAudience;

  nodes: SemanticDiagramNode[];

  edges: SemanticDiagramEdge[];

  groups: SemanticDiagramGroup[];

  lanes: SemanticDiagramLane[];

  boundaries: SemanticDiagramBoundary[];

  layoutIntent: DiagramLayoutIntent;

  preservedConcepts: string[];

  omittedConcepts: string[];

  assumptions: string[];
}

export interface DiagramCriticIssue {
  id: string;

  critic:
    | 'architecture'
    | 'representation'
    | 'coverage'
    | 'visual'
    | 'structural';

  severity:
    | 'critical'
    | 'high'
    | 'medium'
    | 'low';

  issue: string;

  recommendation: string;
}

export interface DiagramCriticReport {
  approved: boolean;

  scores: {
    instructionSatisfaction: number;

    semanticPreservation: number;

    architectureQuality: number;

    diagramTypeCorrectness: number;

    requirementCoverage: number;

    readability: number;

    visualOrganization: number;
  };

  issues: DiagramCriticIssue[];

  summary: string;
}

export interface DiagramIntelligenceResult {
  pipelineDepth: DiagramPipelineDepth;

  intent: DiagramRefinementIntent;

  currentDiagramAnalysis?: CurrentDiagramAnalysis;

  contextSelection?: DiagramContextSelection;

  transformationPlan?: DiagramTransformationPlan;

  semanticDiagram?: SemanticDiagramModel;

  criticReport?: DiagramCriticReport;

  repairAttempts: number;

  xml: string;

  summary: string;

  warnings: string[];
}
