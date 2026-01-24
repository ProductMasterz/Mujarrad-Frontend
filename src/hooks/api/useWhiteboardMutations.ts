/**
 * Whiteboard Mutation Hook - Simplified single-PUT persistence
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { whiteboardService } from '@/services/api/whiteboard.service';
import {
  ExcalidrawElement,
  WhiteboardContextContent,
  WhiteboardAppState,
  BinaryFileData,
} from '@/types/whiteboard';

/**
 * Save entire whiteboard state with a single atomic PUT
 */
export function useSaveWhiteboard(spaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      elements,
      contextNodeId,
      appState,
      files,
    }: {
      elements: ExcalidrawElement[];
      contextNodeId: string | null;
      appState?: Partial<WhiteboardAppState>;
      files?: Record<string, BinaryFileData>;
    }): Promise<{ contextNodeId: string }> => {
      const content: WhiteboardContextContent = {
        elements,
        app_state: appState,
        files,
      };

      // If we have a context node, just PUT the content
      if (contextNodeId) {
        try {
          await whiteboardService.saveWhiteboardContent(spaceSlug, contextNodeId, content);
          return { contextNodeId };
        } catch (error: any) {
          // If context node was deleted externally (404), create a new one
          if (error?.statusCode === 404 || error?.message?.includes('404')) {
            const newContext = await whiteboardService.createWhiteboardContext(spaceSlug, content);
            return { contextNodeId: newContext.id };
          }
          throw error;
        }
      }

      // No context node yet — check if one exists, or create
      const existing = await whiteboardService.getWhiteboardContext(spaceSlug);
      if (existing) {
        await whiteboardService.saveWhiteboardContent(spaceSlug, existing.id, content);
        return { contextNodeId: existing.id };
      }

      // Create new context node with content
      if (elements.length > 0) {
        const newContext = await whiteboardService.createWhiteboardContext(spaceSlug, content);
        return { contextNodeId: newContext.id };
      }

      return { contextNodeId: '' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces', spaceSlug, 'whiteboard'] });
    },
  });
}
