/**
 * Markdown Validation Schemas
 * Feature: 006-markdown-features-start
 *
 * Zod validation schemas for markdown content
 */

import { z } from 'zod';

/**
 * Markdown content schema
 * Validates markdown text with character limit
 */
export const markdownContentSchema = z
  .string()
  .max(50000, 'Content must be less than 50,000 characters')
  .optional()
  .or(z.literal(''));

/**
 * Node with markdown schema
 * Extends existing node validation to include markdown content
 */
export const nodeWithMarkdownSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z
    .string()
    .max(50000, 'Content must be less than 50,000 characters')
    .optional()
    .or(z.literal('')),
  nodeType: z.string().min(1, 'Node type is required'),
});

/**
 * Space with markdown schema
 * Extends existing space validation to include markdown documentation
 */
export const spaceWithMarkdownSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  documentation: z
    .string()
    .max(50000, 'Documentation must be less than 50,000 characters')
    .optional()
    .or(z.literal('')),
});

/**
 * Comment with markdown schema
 * Validates comment text with markdown support
 */
export const commentWithMarkdownSchema = z.object({
  text: z
    .string()
    .min(1, 'Comment text is required')
    .max(50000, 'Comment must be less than 50,000 characters'),
  nodeId: z.string().uuid('Invalid node ID'),
});

/**
 * Note with markdown schema
 * Validates note content with markdown support
 */
export const noteWithMarkdownSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z
    .string()
    .max(50000, 'Content must be less than 50,000 characters')
    .optional()
    .or(z.literal('')),
  spaceId: z.string().uuid('Invalid space ID'),
});
