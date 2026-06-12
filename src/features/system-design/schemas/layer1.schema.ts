import { z } from 'zod';

export const layer1StepIdSchema = z.enum([
  'input',
  'clarification',
  'specification',
  'diagram',
  'review',
  'export',
]);

export const layer1StageSchema = z.enum([
  'input',
  'input_processing',
  'clarification',
  'understanding',
  'specification',
  'diagram',
  'diagram_review',
  'export',
  'approved_layer1_artifact_bundle',
]);

export const questionCategorySchema = z.enum([
  'goal',
  'users',
  'roles_permissions',
  'workflow',
  'alternative_workflows',
  'inputs',
  'outputs',
  'entities',
  'business_rules',
  'decision_logic',
  'validations',
  'edge_cases',
  'error_handling',
  'integrations',
  'security',
  'notifications',
  'reporting',
  'layer1_artifact_preparation',
]);

export const constructiveQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  category: questionCategorySchema,
  reasonForAsking: z.string(),
  basedOn: z.object({
    processedInputId: z.string().optional(),
    chunkIds: z.array(z.string()).optional(),
    previousQuestionIds: z.array(z.string()).optional(),
    previousAnswerIds: z.array(z.string()).optional(),
    understandingFields: z.array(z.string()).optional(),
    missingCategories: z.array(z.string()).optional(),
  }),
  expectedAnswerType: z.enum([
    'short_text',
    'long_text',
    'list',
    'yes_no',
    'choice',
    'number',
    'structured',
  ]),
  options: z.array(z.string()).optional(),
  createdAt: z.string(),
  answeredAt: z.string().optional(),
  answer: z.string().optional(),
  skipped: z.boolean().optional(),
});

export const questionAnswerSchema = z.object({
  id: z.string(),
  questionId: z.string(),
  answer: z.string(),
  createdAt: z.string(),
});

export const systemUnderstandingSchema = z.object({
  summary: z.string(),
  goal: z.string(),
  primaryUsers: z.array(z.string()),
  secondaryUsers: z.array(z.string()),
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
  workflows: z.array(z.unknown()),
  alternativeWorkflows: z.array(z.unknown()),
  inputs: z.array(z.unknown()),
  outputs: z.array(z.unknown()),
  entities: z.array(z.unknown()),
  businessRules: z.array(z.unknown()),
  decisionLogic: z.array(z.unknown()),
  validationRules: z.array(z.unknown()),
  edgeCases: z.array(z.unknown()),
  errorCases: z.array(z.unknown()),
  integrations: z.array(z.unknown()),
  notifications: z.array(z.unknown()),
  reporting: z.array(z.unknown()),
  security: z.array(z.unknown()),
  openQuestions: z.array(z.string()),
  assumptions: z.array(z.string()),
  confidence: z.number(),
});

export const completenessReportSchema = z.object({
  overallScore: z.number(),
  readyForSpec: z.boolean(),
  readyForDiagram: z.boolean(),
  categories: z.array(
    z.object({
      category: questionCategorySchema,
      status: z.enum(['complete', 'weak', 'missing', 'not_applicable']),
      score: z.number(),
      notes: z.string(),
    }),
  ),
  missingCriticalItems: z.array(z.string()),
  weakItems: z.array(z.string()),
  suggestedNextQuestionCategory: questionCategorySchema.optional(),
});

export const layer1ArtifactBundleSchema = z.object({
  markdownSpec: z.string(),
  drawioXml: z.string(),
  diagramImage: z
    .object({
      format: z.enum(['png', 'svg']),
      dataUrl: z.string().optional(),
      fileName: z.string().optional(),
    })
    .optional(),
  diagramSummary: z.string().optional(),
  approvedAt: z.string(),
});
