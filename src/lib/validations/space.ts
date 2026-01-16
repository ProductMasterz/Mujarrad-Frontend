import { z } from 'zod';
import { NodeType } from '@/types/backend-dtos';

/**
 * Space Validation Schemas
 * Based on backend API requirements
 */

export const spaceNameSchema = z.string().min(1, 'Space name is required').max(255, 'Space name must be 255 characters or less');

export const spaceSlugSchema = z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens');

export const createSpaceSchema = z.object({
  name: spaceNameSchema,
  slug: spaceSlugSchema.optional(),
});

export const updateSpaceSchema = z.object({
  name: spaceNameSchema.optional(),
  slug: spaceSlugSchema.optional(),
});

/**
 * Node Validation Schemas
 * Based on backend API requirements
 */

export const nodeTitleSchema = z.string().min(1, 'Node title is required').max(255, 'Node title must be 255 characters or less');

export const nodeContentSchema = z.string();

export const nodeTypeSchema = z.nativeEnum(NodeType);

export const createNodeSchema = z.object({
  title: nodeTitleSchema,
  nodeType: nodeTypeSchema,
  content: nodeContentSchema.optional(),
  nodeDetails: z.record(z.unknown()).optional(),
});

export const updateNodeSchema = z.object({
  title: nodeTitleSchema.optional(),
  content: nodeContentSchema.optional(),
  nodeDetails: z.record(z.unknown()).optional(),
});

// Type exports for use in components
export type CreateSpaceInput = z.infer<typeof createSpaceSchema>;
export type UpdateSpaceInput = z.infer<typeof updateSpaceSchema>;
export type CreateNodeInput = z.infer<typeof createNodeSchema>;
export type UpdateNodeInput = z.infer<typeof updateNodeSchema>;
