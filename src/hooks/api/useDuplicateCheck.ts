/**
 * useDuplicateCheck Hook
 *
 * Checks for duplicate node titles within the same context before creation.
 * Provides options to merge, rename, or create anyway.
 */

import { useCallback } from 'react';
import { useNodes } from './useNodes';
import type { Node } from '@/types/backend-dtos';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingNode: Node | null;
  duplicateCount: number;
}

export interface UseDuplicateCheckOptions {
  /** Space slug to check in */
  spaceSlug: string;
  /** Optional parent context ID to scope the check */
  parentId?: string | null;
}

/**
 * Hook to check for duplicate node titles
 */
export const useDuplicateCheck = ({ spaceSlug, parentId }: UseDuplicateCheckOptions) => {
  const { data: nodes = [], isLoading } = useNodes(spaceSlug);

  /**
   * Check if a title already exists in the same context
   *
   * @param title - Title to check
   * @returns Result with duplicate info
   */
  const checkDuplicate = useCallback(
    (title: string): DuplicateCheckResult => {
      if (!title.trim() || isLoading) {
        return { isDuplicate: false, existingNode: null, duplicateCount: 0 };
      }

      const normalizedTitle = title.trim().toLowerCase();

      // Find nodes with matching title
      // If parentId is provided, we'd filter by parent - but since we don't have
      // parent info in the node object directly, we check space-wide for now
      // In a full implementation, we'd check the attributes for containment
      const duplicates = nodes.filter(
        (node) => node.title.trim().toLowerCase() === normalizedTitle
      );

      if (duplicates.length === 0) {
        return { isDuplicate: false, existingNode: null, duplicateCount: 0 };
      }

      return {
        isDuplicate: true,
        existingNode: duplicates[0],
        duplicateCount: duplicates.length,
      };
    },
    [nodes, isLoading]
  );

  /**
   * Generate a unique title by appending a number
   *
   * @param title - Original title
   * @returns Unique title with number suffix
   */
  const generateUniqueTitle = useCallback(
    (title: string): string => {
      const baseTitle = title.trim();
      let counter = 2;
      let newTitle = `${baseTitle} (${counter})`;

      while (
        nodes.some((node) => node.title.trim().toLowerCase() === newTitle.toLowerCase())
      ) {
        counter++;
        newTitle = `${baseTitle} (${counter})`;
      }

      return newTitle;
    },
    [nodes]
  );

  return {
    checkDuplicate,
    generateUniqueTitle,
    isLoading,
  };
};

/**
 * Type for duplicate action chosen by user
 */
export type DuplicateAction = 'merge' | 'create-anyway' | 'rename' | 'cancel';
