import { z } from 'zod';

import { rawInputPayloadSchema } from './input.schema';
import { layer1StepIdSchema } from './layer1.schema';

export const layer1GraphEventSchema = z.object({
  type: z.enum([
    'start_run',
    'submit_input',
    'submit_answer',
    'generate_question',
    'skip_to_diagram',
    'complete_step',
    'sync_state',
    'reset_run',
  ]),
  rawInput: rawInputPayloadSchema.optional(),
  answer: z.string().trim().min(1).optional(),
  stepId: layer1StepIdSchema.optional(),
});

export const layer1GraphNextActionSchema = z.enum([
  'process_input',
  'ask_question',
  'wait_for_answer',
  'update_understanding',
  'check_completeness',
  'generate_diagram',
  'wait_for_diagram_review',
  'refine_diagram',
  'generate_final_docs',
  'wait_for_final_docs_review',
  'create_artifact_bundle',
  'complete',
  'error',
]);

export const layer1ApiRequestSchema = z.object({
  event: layer1GraphEventSchema,
  state: z.unknown().optional(),
});
