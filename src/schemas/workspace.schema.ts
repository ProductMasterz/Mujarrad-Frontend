// src/schemas/workspace.schema.ts

import { z } from 'zod';

/**
 * Create workspace form schema
 */
export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must not exceed 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .regex(/^[a-z]/, 'Slug must start with a letter')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
});

export type CreateWorkspaceFormData = z.infer<typeof createWorkspaceSchema>;

/**
 * Update workspace form schema
 */
export const updateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must not exceed 100 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
});

export type UpdateWorkspaceFormData = z.infer<typeof updateWorkspaceSchema>;
