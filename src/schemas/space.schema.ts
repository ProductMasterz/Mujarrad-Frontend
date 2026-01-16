// src/schemas/space.schema.ts

import { z } from 'zod';

/**
 * Create space form schema
 */
export const createSpaceSchema = z.object({
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

export type CreateSpaceFormData = z.infer<typeof createSpaceSchema>;

/**
 * Update space form schema
 */
export const updateSpaceSchema = z.object({
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

export type UpdateSpaceFormData = z.infer<typeof updateSpaceSchema>;

/**
 * Invite collaborator form schema
 * Requires either email or username
 */
export const inviteCollaboratorSchema = z.object({
  email: z
    .string()
    .email('Valid email required')
    .optional(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters')
    .optional(),
}).refine(data => data.email || data.username, {
  message: 'Either email or username is required',
  path: ['email'], // Show error on email field
});

export type InviteCollaboratorFormData = z.infer<typeof inviteCollaboratorSchema>;
