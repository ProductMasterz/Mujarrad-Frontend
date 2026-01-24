/**
 * Whiteboard Query Hooks - Simplified load with format migration
 */

import { useQuery } from '@tanstack/react-query';
import { whiteboardService } from '@/services/api/whiteboard.service';
import {
  ExcalidrawElement,
  WhiteboardAppState,
  BinaryFileData,
} from '@/types/whiteboard';

/**
 * Fetch the whiteboard context node for a space
 */
export function useWhiteboardContext(spaceSlug: string) {
  return useQuery({
    queryKey: ['spaces', spaceSlug, 'whiteboard', 'context'],
    queryFn: () => whiteboardService.getWhiteboardContext(spaceSlug),
    staleTime: 30000,
    enabled: !!spaceSlug,
  });
}

/**
 * Fetch whiteboard state from context node content
 * Handles both old format (WhiteboardElementEntry[]) and new format (ExcalidrawElement[])
 */
export function useWhiteboardState(spaceSlug: string) {
  const contextQuery = useWhiteboardContext(spaceSlug);

  // Parse content — migration from old to new format is handled inside parseWhiteboardContent
  const content = contextQuery.data
    ? whiteboardService.parseWhiteboardContent(contextQuery.data)
    : { elements: [] };

  return {
    elements: content.elements as ExcalidrawElement[],
    contextNodeId: contextQuery.data?.id || null,
    appState: content.app_state as Partial<WhiteboardAppState> | undefined,
    files: content.files as Record<string, BinaryFileData> | undefined,
    isLoading: contextQuery.isLoading,
    isError: contextQuery.isError,
    error: contextQuery.error,
  };
}
