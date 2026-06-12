import { z } from 'zod';

import { rawInputPayloadSchema } from './input.schema';
import { layer1StepIdSchema } from './layer1.schema';

export const layer1GraphEventSchema = z.object({
  type: z.enum([
    'start_run',
    'submit_input',
    'complete_step',
    'sync_state',
    'reset_run',
  ]),
  rawInput: rawInputPayloadSchema.optional(),
  stepId: layer1StepIdSchema.optional(),
});

export const layer1GraphNextActionSchema = z.enum([
  'process_input',
  'ask_question',
  'wait_for_answer',
  'update_understanding',
  'check_completeness',
  'generate_spec',
  'wait_for_spec_review',
  'generate_diagram',
  'wait_for_diagram_review',
  'refine_diagram',
  'create_artifact_bundle',
  'complete',
  'error',
]);

export const layer1ApiRequestSchema = z.object({
  event: layer1GraphEventSchema,
  state: z.unknown().optional(),
});
