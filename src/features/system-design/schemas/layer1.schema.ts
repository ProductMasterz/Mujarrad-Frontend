import { z } from 'zod';

export const layer1StepIdSchema = z.enum([
  'input',
  'clarification',
  'diagram',
  'review',
  'final_docs',
  'export',
]);

export const layer1StageSchema = z.enum([
  'input',
  'input_processing',
  'clarification',
  'understanding',
  'diagram',
  'diagram_review',
  'final_docs',
  'export',
  'approved_layer1_artifact_bundle',
]);

export const questionCategorySchema = z.string().trim().min(1);

export const expectedAnswerTypeSchema = z.enum([
  'short_text',
  'long_text',
  'list',
  'yes_no',
  'choice',
  'number',
  'structured',
]);

export const constructiveQuestionSchema = z.object({
  id: z.string(),
  question: z.string().trim().min(1),
  category: questionCategorySchema,
  reasonForAsking: z.string().trim().min(1),
  basedOn: z.object({
    processedInputId: z.string().optional(),
    chunkIds: z.array(z.string()).optional(),
    previousQuestionIds: z.array(z.string()).optional(),
    previousAnswerIds: z.array(z.string()).optional(),
    understandingFields: z.array(z.string()).optional(),
    missingCategories: z.array(z.string()).optional(),
  }),
  expectedAnswerType: expectedAnswerTypeSchema,
  options: z.array(z.string()).optional(),
  createdAt: z.string(),
  answeredAt: z.string().optional(),
  answer: z.string().optional(),
  skipped: z.boolean().optional(),
});

export const constructiveQuestionAiResponseSchema = z.object({
  question: z.string().trim().min(1),
  category: questionCategorySchema,
  reasonForAsking: z.string().trim().min(1),
  expectedAnswerType: expectedAnswerTypeSchema,
  options: z.array(z.string()).optional(),
  understandingFields: z.array(z.string()).optional(),
});

const workflowDescriptionSchema = z.object({
  id: z.string(),
  title: z.string(),
  steps: z.array(z.string()),
});

const systemInputSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

const systemOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

const systemEntitySchema = z.object({
  id: z.string(),
  name: z.string(),
  attributes: z.array(z.string()),
});

const businessRuleSchema = z.object({
  id: z.string(),
  rule: z.string(),
});

const decisionRuleSchema = z.object({
  id: z.string(),
  condition: z.string(),
  outcome: z.string(),
});

const validationRuleSchema = z.object({
  id: z.string(),
  field: z.string(),
  rule: z.string(),
});

const edgeCaseSchema = z.object({
  id: z.string(),
  case: z.string(),
});

const errorCaseSchema = z.object({
  id: z.string(),
  error: z.string(),
  handling: z.string(),
});

const integrationPointSchema = z.object({
  id: z.string(),
  name: z.string(),
  purpose: z.string(),
});

const notificationRuleSchema = z.object({
  id: z.string(),
  trigger: z.string(),
  message: z.string(),
});

const reportingRequirementSchema = z.object({
  id: z.string(),
  report: z.string(),
  audience: z.string().optional(),
});

const securityRequirementSchema = z.object({
  id: z.string(),
  requirement: z.string(),
});

export const systemUnderstandingSchema = z.object({
  summary: z.string(),
  goal: z.string(),
  primaryUsers: z.array(z.string()),
  secondaryUsers: z.array(z.string()),
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
  workflows: z.array(workflowDescriptionSchema),
  alternativeWorkflows: z.array(workflowDescriptionSchema),
  inputs: z.array(systemInputSchema),
  outputs: z.array(systemOutputSchema),
  entities: z.array(systemEntitySchema),
  businessRules: z.array(businessRuleSchema),
  decisionLogic: z.array(decisionRuleSchema),
  validationRules: z.array(validationRuleSchema),
  edgeCases: z.array(edgeCaseSchema),
  errorCases: z.array(errorCaseSchema),
  integrations: z.array(integrationPointSchema),
  notifications: z.array(notificationRuleSchema),
  reporting: z.array(reportingRequirementSchema),
  security: z.array(securityRequirementSchema),
  openQuestions: z.array(z.string()),
  assumptions: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

export const completenessStatusSchema = z.enum([
  'complete',
  'weak',
  'missing',
  'not_applicable',
]);

export const completenessCategoryStatusSchema = z.object({
  category: questionCategorySchema,
  status: completenessStatusSchema,
  score: z.number().min(0).max(100),
  notes: z.string(),
});

export const completenessReportSchema = z.object({
  overallScore: z.number().min(0).max(100),
  readyForDiagram: z.boolean(),
  readyForSpec: z.boolean().optional(),
  categories: z.array(completenessCategoryStatusSchema),
  missingCriticalItems: z.array(z.string()).default([]),
  weakItems: z.array(z.string()).default([]),
  suggestedNextQuestionCategory: questionCategorySchema.optional(),
});

export type Layer1StepIdSchema = z.infer<typeof layer1StepIdSchema>;
export type Layer1StageSchema = z.infer<typeof layer1StageSchema>;
