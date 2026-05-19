// src/schemas/version.schema.ts

import { z } from 'zod';

/**
 * Restore version form schema
 */
export const restoreVersionSchema = z.object({
  versionId: z
    .number()
    .int('Version ID must be an integer')
    .positive('Version ID must be positive'),
  confirmation: z
    .boolean()
    .refine((val) => val === true, {
      message: 'You must confirm the restoration',
    }),
});

export type RestoreVersionFormData = z.infer<typeof restoreVersionSchema>;

/**
 * Version comparison schema (for selecting two versions to compare)
 */
export const compareVersionsSchema = z.object({
  versionA: z
    .number()
    .int('Version must be an integer')
    .positive('Version must be positive'),
  versionB: z
    .number()
    .int('Version must be an integer')
    .positive('Version must be positive'),
}).refine((data) => data.versionA !== data.versionB, {
  message: 'Please select two different versions to compare',
  path: ['versionB'],
});

export type CompareVersionsFormData = z.infer<typeof compareVersionsSchema>;
