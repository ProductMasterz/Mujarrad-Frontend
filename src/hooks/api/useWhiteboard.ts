/**
 * Whiteboard Query Hooks
 * Generated with assistance from ollama:llama3.1:8b
 */

import { useQuery } from '@tanstack/react-query';
import { whiteboardService } from '@/services/api/whiteboard.service';
import { WhiteboardNode, ExcalidrawElement, WhiteboardAppState } from '@/types/whiteboard';
import { mapNodeToExcalidraw } from '@/lib/whiteboard/elementMapper';

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
 * Fetch raw whiteboard nodes from the API
 */
export function useWhiteboardNodes(spaceSlug: string) {
  return useQuery({
    queryKey: ['spaces', spaceSlug, 'whiteboard'],
    queryFn: () => whiteboardService.getWhiteboardNodes(spaceSlug),
    staleTime: 30000, // 30 seconds
    enabled: !!spaceSlug,
  });
}

/**
 * Fetch whiteboard nodes and convert to Excalidraw elements
 */
export function useWhiteboardState(spaceSlug: string) {
  const nodesQuery = useWhiteboardNodes(spaceSlug);

  const elements: ExcalidrawElement[] = nodesQuery.data
    ? nodesQuery.data.map(mapNodeToExcalidraw)
    : [];

  return {
    elements,
    nodes: nodesQuery.data || [],
    isLoading: nodesQuery.isLoading,
    isError: nodesQuery.isError,
    error: nodesQuery.error,
    refetch: nodesQuery.refetch,
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
