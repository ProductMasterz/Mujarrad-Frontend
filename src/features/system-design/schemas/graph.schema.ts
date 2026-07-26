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
    'generate_diagram',
    'refine_diagram',
    'sync_diagram_xml',
    'undo_diagram_revision',
    'reset_diagram_revision',
    'approve_diagram',
    'save_layer1_to_mujarrad',
    'skip_mujarrad_save',
    'generate_final_docs',
    'complete_step',
    'sync_state',
    'reset_run',
  ]),
  rawInput: rawInputPayloadSchema.optional(),
  answer: z.string().trim().min(1).optional(),
  stepId: layer1StepIdSchema.optional(),
  refinementInstruction: z.string().trim().min(1).optional(),
  xml: z.string().trim().min(1).optional(),

  mermaidSource:
    z.string().trim().min(1).optional(),

  diagramRenderer:
    z
      .enum([
        'drawio',
        'mermaid',
      ])
      .optional(),

  diagramImages: z
    .object({
      svg: z
        .object({
          dataUrl: z.string().min(1),
          fileName: z.string().min(1),
        })
        .optional(),
      png: z
        .object({
          dataUrl: z.string().min(1),
          fileName: z.string().min(1),
        })
        .optional(),
    })
    .optional(),
  mujarradDestination: z
    .object({
      mode: z.enum(['existing', 'new']),
      spaceSlug: z.string().trim().min(1).optional(),
      contextId: z.string().trim().min(1).optional(),
      newSpaceName: z.string().trim().min(1).optional(),
      newContextName: z.string().trim().min(1).optional(),
    })
    .optional(),
});

export const layer1GraphNextActionSchema = z.enum([
  'process_input',
  'ask_question',
  'wait_for_answer',
  'update_understanding',
  'check_completeness',
  'generate_diagram',
  'wait_for_diagram_approval',
  'refine_diagram',
  'save_layer1_to_mujarrad',
  'skip_mujarrad_save',
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
