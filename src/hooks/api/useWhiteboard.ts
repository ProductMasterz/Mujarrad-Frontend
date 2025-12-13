/**
 * Whiteboard Query Hooks
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
 * Returns elements for Excalidraw and node mapping for persistence
 */
export function useWhiteboardState(spaceSlug: string) {
  const contextQuery = useWhiteboardContext(spaceSlug);

  // Parse content from context node
  const content = contextQuery.data
    ? whiteboardService.parseWhiteboardContent(contextQuery.data)
    : { elements: [] };

  console.log('[useWhiteboardState] Loading whiteboard state:', {
    hasContextNode: !!contextQuery.data,
    contextNodeId: contextQuery.data?.id,
    contentElementsCount: content.elements.length,
    rawContent: contextQuery.data?.content?.substring(0, 200),
  });

  // Extract Excalidraw elements
  let elements: ExcalidrawElement[] = content.elements.map(
    entry => entry.excalidraw_element
  );

  // Build element ID to node ID map
  const nodeMap = new Map<string, string>();
  content.elements.forEach(entry => {
    if (entry.node_id && entry.excalidraw_element.id) {
      nodeMap.set(entry.excalidraw_element.id, entry.node_id);
    }
  });

  console.log('[useWhiteboardState] Parsed state:', {
    elementsCount: elements.length,
    nodeMapSize: nodeMap.size,
  });

  return {
    elements,
    nodeMap,
    contextNodeId: contextQuery.data?.id || null,
    appState: content.app_state as Partial<WhiteboardAppState> | undefined,
    files: content.files as Record<string, BinaryFileData> | undefined,
    isLoading: contextQuery.isLoading,
    isError: contextQuery.isError,
    error: contextQuery.error,
    refetch: contextQuery.refetch,
  };
}

/**
 * Fetch connectors for a space
 */
export function useWhiteboardConnectors(spaceSlug: string) {
  return useQuery({
    queryKey: ['spaces', spaceSlug, 'whiteboard', 'connectors'],
    queryFn: () => whiteboardService.getConnectors(spaceSlug),
    staleTime: 30000,
    enabled: !!spaceSlug,
  });
}
