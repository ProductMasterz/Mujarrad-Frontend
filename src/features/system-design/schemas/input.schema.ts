import { z } from 'zod';

export const systemDesignInputSourceTypeSchema = z.enum([
  'typed_text',
  'pasted_text',
  'voice_transcript',
  'file_text',
]);

export const inputProcessingStatusSchema = z.enum([
  'idle',
  'normalizing',
  'chunking',
  'compressing',
  'ready',
  'failed',
]);

export const inputProcessingWarningCodeSchema = z.enum([
  'empty_input',
  'short_input',
  'large_input',
  'chunking_applied',
  'compression_placeholder_used',
  'unsupported_source',
]);

export const inputProcessingWarningSchema = z.object({
  code: inputProcessingWarningCodeSchema,
  message: z.string().min(1),
});

export const rawInputPayloadSchema = z.object({
  id: z.string().min(1),
  sourceType: systemDesignInputSourceTypeSchema,
  rawText: z.string(),
  createdAt: z.string().min(1),
  metadata: z
    .object({
      fileName: z.string().optional(),
      audioDurationSeconds: z.number().nonnegative().optional(),
      language: z.string().optional(),
    })
    .optional(),
});

export const inputSizeSchema = z.object({
  characters: z.number().int().nonnegative(),
  estimatedTokens: z.number().int().nonnegative(),
  chunkCount: z.number().int().nonnegative(),
});

export const textChunkSchema = z.object({
  id: z.string().min(1),
  index: z.number().int().nonnegative(),
  text: z.string(),
  summary: z.string().optional(),
  characterStart: z.number().int().nonnegative(),
  characterEnd: z.number().int().nonnegative(),
});

export const processedInputContextSchema = z.object({
  id: z.string().min(1),
  sourceInputIds: z.array(z.string().min(1)),
  normalizedText: z.string(),
  chunks: z.array(textChunkSchema),
  compressedSummary: z.string(),
  inputSize: inputSizeSchema,
  processingWarnings: z.array(inputProcessingWarningSchema),
  createdAt: z.string().min(1),
});

export const inputProcessingResultSchema = z.object({
  status: inputProcessingStatusSchema,
  rawInput: rawInputPayloadSchema,
  processedInput: processedInputContextSchema.nullable(),
  warnings: z.array(inputProcessingWarningSchema),
  errors: z.array(z.string()),
});

export const transcriptionResultSchema = z.object({
  id: z.string().min(1),
  audioSourceName: z.string().optional(),
  transcript: z.string(),
  language: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  durationSeconds: z.number().nonnegative().optional(),
  createdAt: z.string().min(1),
});
