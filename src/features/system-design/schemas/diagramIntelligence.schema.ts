import { z } from 'zod';

export const diagramPipelineDepthSchema =
  z.enum([
    'fast_edit',
    'advanced_modification',
    'expert_reconstruction',
  ]);

export const diagramOperationSchema = z.enum([
  'rename',
  'move',
  'connect',
  'disconnect',
  'add_element',
  'remove_element',
  'style_change',
  'layout_improvement',
  'semantic_enrichment',
  'structural_refactor',
  'architecture_improvement',
  'architecture_transformation',
  'diagram_type_conversion',
  'audience_transformation',
  'simplification',
  'expansion',
  'full_reconstruction',
]);

export const diagramScopeSchema = z.enum([
  'single_element',
  'selected_region',
  'subsystem',
  'whole_diagram',
  'whole_system',
]);

export const diagramTypeSchema = z.enum([
  'auto',
  'generic',
  'flowchart',
  'system_architecture',
  'software_architecture',
  'solution_architecture',
  'cloud_architecture',
  'infrastructure_architecture',
  'network_architecture',
  'security_architecture',
  'integration_architecture',
  'data_flow',
  'data_pipeline',
  'event_driven_topology',
  'ai_ml_pipeline',
  'rag_architecture',
  'agent_architecture',
  'c4_context',
  'c4_container',
  'c4_component',
  'uml_activity',
  'uml_sequence',
  'uml_component',
  'uml_deployment',
  'uml_class',
  'uml_state_machine',
  'entity_relationship',
  'business_process',
  'swimlane',
]);

export const diagramAudienceSchema = z.enum([
  'auto',
  'executive',
  'product',
  'business',
  'software_architect',
  'backend_engineer',
  'frontend_engineer',
  'devops_engineer',
  'security_engineer',
  'data_engineer',
  'ai_engineer',
  'database_engineer',
  'mixed_technical',
]);

export const diagramGoalSchema = z.enum([
  'preserve_meaning',
  'improve_architecture',
  'improve_readability',
  'improve_completeness',
  'improve_security',
  'improve_resilience',
  'improve_scalability',
  'improve_observability',
  'improve_data_flow',
  'improve_deployment',
  'reduce_complexity',
  'increase_technical_detail',
  'change_representation',
  'change_audience',
]);

export const diagramPreservationPolicySchema =
  z.enum([
    'strict',
    'preserve_business_meaning',
    'preserve_core_architecture',
    'architectural_changes_allowed',
    'full_redesign_allowed',
  ]);

export const diagramRefinementIntentSchema =
  z.object({
    pipelineDepth:
      diagramPipelineDepthSchema,

    operation:
      diagramOperationSchema,

    scope:
      diagramScopeSchema,

    targetDiagramType:
      diagramTypeSchema,

    audience:
      diagramAudienceSchema,

    goals:
      z.array(diagramGoalSchema),

    preservationPolicy:
      diagramPreservationPolicySchema,

    requiresSystemContext:
      z.boolean(),

    requiresCurrentDiagramAnalysis:
      z.boolean(),

    requiresArchitectureReasoning:
      z.boolean(),

    requiresRepresentationExpert:
      z.boolean(),

    requiresLayoutPlanning:
      z.boolean(),

    requiresCriticReview:
      z.boolean(),

    requiresRepairLoop:
      z.boolean(),

    userGoal:
      z.string().min(1),

    confidence:
      z.number().min(0).max(1),

    rationale:
      z.string().min(1),
  });

export const diagramTransformationStepSchema =
  z.object({
    id: z.string().min(1),

    action: z.enum([
      'preserve',
      'add',
      'remove',
      'transform',
      'reconnect',
      'regroup',
      'relayout',
      'annotate',
    ]),

    target: z.string().min(1),

    reason: z.string().min(1),

    priority: z.enum([
      'critical',
      'high',
      'medium',
      'low',
    ]),
  });

export const diagramTransformationPlanSchema =
  z.object({
    sourceDiagramType:
      diagramTypeSchema,

    targetDiagramType:
      diagramTypeSchema,

    strategy:
      z.string().min(1),

    preserve:
      z.array(z.string()),

    remove:
      z.array(z.string()),

    add:
      z.array(z.string()),

    steps:
      z.array(
        diagramTransformationStepSchema,
      ),

    requiredElements:
      z.array(z.string()),

    requiredRelationships:
      z.array(z.string()),

    architectureDecisions:
      z.array(z.string()),

    layoutStrategy:
      z.string().min(1),

    validationCriteria:
      z.array(z.string()),

    risks:
      z.array(z.string()),

    assumptions:
      z.array(z.string()),
  });

export const diagramElementAnalysisSchema =
  z.object({
    id: z.string().min(1),

    label: z.string(),

    semanticType: z.string().min(1),

    parentId: z.string().optional(),

    x: z.number().optional(),

    y: z.number().optional(),

    width: z.number().optional(),

    height: z.number().optional(),

    important: z.boolean(),
  });

export const diagramRelationshipAnalysisSchema =
  z.object({
    id: z.string().min(1),

    sourceId: z.string().min(1),

    targetId: z.string().min(1),

    label: z.string().optional(),

    semanticType: z.string().min(1),
  });

export const currentDiagramAnalysisSchema =
  z.object({
    detectedDiagramType:
      diagramTypeSchema,

    title: z.string().optional(),

    elements:
      z.array(
        diagramElementAnalysisSchema,
      ),

    relationships:
      z.array(
        diagramRelationshipAnalysisSchema,
      ),

    groups:
      z.array(z.string()),

    boundaries:
      z.array(z.string()),

    majorFlows:
      z.array(z.string()),

    semanticConcepts:
      z.array(z.string()),

    strengths:
      z.array(z.string()),

    structuralProblems:
      z.array(z.string()),

    architectureProblems:
      z.array(z.string()),

    visualProblems:
      z.array(z.string()),

    missingConcepts:
      z.array(z.string()),

    summary:
      z.string().min(1),
  });

export const diagramContextSelectionSchema =
  z.object({
    selectedUnderstandingFields:
      z.array(z.string()),

    relevantWorkflows:
      z.array(z.string()),

    relevantBusinessRules:
      z.array(z.string()),

    relevantDecisionLogic:
      z.array(z.string()),

    relevantIntegrations:
      z.array(z.string()),

    relevantSecurityRequirements:
      z.array(z.string()),

    relevantErrorCases:
      z.array(z.string()),

    relevantEdgeCases:
      z.array(z.string()),

    relevantEntities:
      z.array(z.string()),

    relevantAssumptions:
      z.array(z.string()),

    contextSummary:
      z.string().min(1),
  });

export const semanticDiagramNodeSchema =
  z.object({
    id: z.string().min(1),

    type: z.string().min(1),

    label: z.string().min(1),

    description:
      z.string().optional(),

    groupId:
      z.string().optional(),

    laneId:
      z.string().optional(),

    importance: z.enum([
      'primary',
      'secondary',
      'supporting',
    ]),

    metadata:
      z.record(
        z.union([
          z.string(),
          z.number(),
          z.boolean(),
        ]),
      )
      .optional(),
  });

export const semanticDiagramEdgeSchema =
  z.object({
    id: z.string().min(1),

    sourceId:
      z.string().min(1),

    targetId:
      z.string().min(1),

    type:
      z.string().min(1),

    label:
      z.string().optional(),

    direction: z.enum([
      'forward',
      'backward',
      'bidirectional',
    ]),

    metadata:
      z.record(
        z.union([
          z.string(),
          z.number(),
          z.boolean(),
        ]),
      )
      .optional(),
  });

export const semanticDiagramGroupSchema =
  z.object({
    id: z.string().min(1),

    label: z.string().min(1),

    type: z.string().min(1),

    parentId:
      z.string().optional(),
  });

export const semanticDiagramLaneSchema =
  z.object({
    id: z.string().min(1),

    label: z.string().min(1),

    order: z.number().int(),
  });

export const semanticDiagramBoundarySchema =
  z.object({
    id: z.string().min(1),

    label: z.string().min(1),

    type: z.enum([
      'system',
      'security',
      'deployment',
      'network',
      'domain',
      'data',
    ]),

    memberIds:
      z.array(z.string()),
  });

export const diagramLayoutIntentSchema =
  z.object({
    direction: z.enum([
      'left_to_right',
      'top_to_bottom',
      'radial',
      'timeline',
      'swimlane',
    ]),

    hierarchyLevels:
      z.array(z.string()),

    groupOrder:
      z.array(z.string()),

    minimizeCrossings:
      z.boolean(),

    emphasizePrimaryFlow:
      z.boolean(),

    density: z.enum([
      'compact',
      'balanced',
      'spacious',
    ]),

    edgeRouting: z.enum([
      'orthogonal',
      'curved',
      'direct',
    ]),

    notes:
      z.array(z.string()),
  });

export const semanticDiagramModelSchema =
  z.object({
    version:
      z.literal('1.0'),

    diagramType:
      diagramTypeSchema,

    title:
      z.string().min(1),

    purpose:
      z.string().min(1),

    audience:
      diagramAudienceSchema,

    nodes:
      z.array(
        semanticDiagramNodeSchema,
      ),

    edges:
      z.array(
        semanticDiagramEdgeSchema,
      ),

    groups:
      z.array(
        semanticDiagramGroupSchema,
      ),

    lanes:
      z.array(
        semanticDiagramLaneSchema,
      ),

    boundaries:
      z.array(
        semanticDiagramBoundarySchema,
      ),

    layoutIntent:
      diagramLayoutIntentSchema,

    preservedConcepts:
      z.array(z.string()),

    omittedConcepts:
      z.array(z.string()),

    assumptions:
      z.array(z.string()),
  });
