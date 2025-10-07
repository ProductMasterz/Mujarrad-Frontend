// src/schemas/node.schema.ts

import { z } from 'zod';
import { NodeType } from '@/types/backend-dtos';

/**
 * Create node form schema
 */
export const createNodeSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),
  nodeType: z.nativeEnum(NodeType, {
    errorMap: () => ({ message: 'Invalid node type' }),
  }),
  markdownContent: z
    .string()
    .max(50000, 'Content must not exceed 50,000 characters')
    .default(''),
  nodeDetails: z
    .record(z.unknown())
    .optional(),
});

export type CreateNodeFormData = z.infer<typeof createNodeSchema>;

/**
 * Update node form schema
 */
export const updateNodeSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters')
    .trim()
    .optional(),
  nodeType: z.nativeEnum(NodeType).optional(),
  markdownContent: z
    .string()
    .max(50000, 'Content must not exceed 50,000 characters')
    .optional(),
  nodeDetails: z
    .record(z.unknown())
    .optional(),
  version: z
    .number()
    .int('Version must be an integer')
    .positive('Version must be positive'),
});

export type UpdateNodeFormData = z.infer<typeof updateNodeSchema>;
