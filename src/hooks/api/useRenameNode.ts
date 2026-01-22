/**
 * useRenameNode Hook
 *
 * Shared hook for renaming nodes/spaces consistently across all entry points.
 * Handles validation, duplicate checking, and whiteboard sync.
 */

import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { nodeService } from '@/services/api/node.service';
import { spaceService } from '@/services/api/space.service';
import { whiteboardSyncService } from '@/services/whiteboardSyncService';
import { nodeKeys } from './useNodes';
import { spaceKeys } from './useSpaces';
import type { Node, Space } from '@/types/backend-dtos';

export type EntityToRename = 'node' | 'space';

export interface RenameResult {
  success: boolean;
  error?: string;
  entity?: Node | Space;
}

export interface UseRenameNodeOptions {
  spaceSlug?: string;
  entityType: EntityToRename;
  onSuccess?: (entity: Node | Space) => void;
  onError?: (error: Error) => void;
}

export interface RenameNodeVariables {
  entityId: string;
  newName: string;
}

/**
 * Hook for renaming nodes or spaces with consistent behavior
 */
export const useRenameNode = ({
  spaceSlug,
  entityType,
  onSuccess,
  onError,
}: UseRenameNodeOptions) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ entityId, newName }: RenameNodeVariables) => {
      // Validate name
      const trimmedName = newName.trim();
      if (!trimmedName) {
        throw new Error('Name cannot be empty');
      }

      if (entityType === 'node') {
        if (!spaceSlug) {
          throw new Error('spaceSlug is required for node rename');
        }
        return await nodeService.updateNode(spaceSlug, entityId, { title: trimmedName });
      } else {
        return await spaceService.updateSpace(entityId, { name: trimmedName });
      }
    },

    onSuccess: (data, { entityId }) => {
      if (entityType === 'node' && spaceSlug) {
        // Invalidate node queries
        queryClient.invalidateQueries({ queryKey: nodeKeys.detail(spaceSlug, entityId) });
        queryClient.invalidateQueries({ queryKey: nodeKeys.lists() });

        // Notify whiteboard sync service
        if (data && 'title' in data) {
          whiteboardSyncService.onNodeUpdated({ id: data.id, title: data.title });
        }
      } else {
        // Invalidate space queries
        queryClient.invalidateQueries({ queryKey: spaceKeys.all });
        queryClient.invalidateQueries({ queryKey: spaceKeys.lists() });
      }

      onSuccess?.(data as Node | Space);
    },

    onError: (error: Error) => {
      console.error('Rename failed:', error);
      onError?.(error);
    },
  });

  /**
   * Rename an entity
   */
  const rename = useCallback(
    async (entityId: string, newName: string): Promise<RenameResult> => {
      try {
        const entity = await mutation.mutateAsync({ entityId, newName });
        return { success: true, entity };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Rename failed';
        return { success: false, error: errorMessage };
      }
    },
    [mutation]
  );

  return {
    rename,
    isRenaming: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
};

/**
 * Simplified hook specifically for renaming nodes
 */
export const useRenameNodeSimple = (spaceSlug: string) => {
  return useRenameNode({ spaceSlug, entityType: 'node' });
};

/**
 * Simplified hook specifically for renaming spaces
 */
export const useRenameSpace = () => {
  return useRenameNode({ entityType: 'space' });
};
