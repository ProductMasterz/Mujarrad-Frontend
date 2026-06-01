// src/services/api/node-move.service.ts

import apiClient from './client';
import type {
  MoveNodeRequest,
  MoveNodeResponse,
} from '@/types/backend-dtos';

/**
 * Node Move Service
 * Handles API calls for moving nodes between spaces
 * Backend endpoint: POST /api/spaces/{spaceSlug}/nodes/{nodeId}/move
 */
export const nodeMoveService = {
  /**
   * Move a node to another space
   * API Contract: POST /api/spaces/{spaceSlug}/nodes/{nodeId}/move
   * @param spaceSlug - Source space slug
   * @param nodeId - Node UUID to move
   * @param data - Move request with target space and options
   * @returns Move response with node and relationship info
   */
  async moveNode(
    spaceSlug: string,
    nodeId: string,
    data: MoveNodeRequest
  ): Promise<MoveNodeResponse> {
    const response = await apiClient.post<MoveNodeResponse>(
      `/spaces/${spaceSlug}/nodes/${nodeId}/move`,
      data
    );
    return response.data;
  },
};

// Export type for use in hooks and components
export type NodeMoveService = typeof nodeMoveService;
