// src/schemas/attribute.schema.ts

import { z } from 'zod';
import { AttributeKey } from '@/types/backend-dtos';

/**
 * Create attribute/relationship form schema
 */
export const createAttributeSchema = z.object({
  targetNodeId: z
    .number()
    .int('Target node ID must be an integer')
    .positive('Target node ID must be positive'),
  attributeKey: z.nativeEnum(AttributeKey, {
    errorMap: () => ({ message: 'Invalid relationship type' }),
  }),
  attributeValue: z
    .string()
    .max(1000, 'Attribute value must not exceed 1,000 characters')
    .optional(),
  metadata: z
    .record(z.unknown())
    .optional(),
});

export type CreateAttributeFormData = z.infer<typeof createAttributeSchema>;

/**
 * Helper: Get human-readable label for attribute key
 */
export const attributeKeyLabels: Record<AttributeKey, string> = {
  [AttributeKey.CONTAINS]: 'Contains',
  [AttributeKey.DEPENDS_ON]: 'Depends On',
  [AttributeKey.REFERENCES]: 'References',
  [AttributeKey.PARENT_OF]: 'Parent Of',
  [AttributeKey.RELATES_TO]: 'Relates To',
};

/**
 * Helper: Get description for each relationship type
 */
export const attributeKeyDescriptions: Record<AttributeKey, string> = {
  [AttributeKey.CONTAINS]: 'Hierarchical containment (parent-child relationship, must be acyclic)',
  [AttributeKey.DEPENDS_ON]: 'Dependency relationship (can form cycles)',
  [AttributeKey.REFERENCES]: 'Cross-reference or citation (can form cycles)',
  [AttributeKey.PARENT_OF]: 'Parent-child relationship between nodes',
  [AttributeKey.RELATES_TO]: 'General association between nodes (can form cycles)',
};
