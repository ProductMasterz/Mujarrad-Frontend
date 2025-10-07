// src/services/api/version.service.ts

import apiClient from './client';
import type { NodeVersion, Node } from '@/types/backend-dtos';

export const versionService = {
  /**
   * Get all versions for a node
   */
  async getNodeVersions(workspaceSlug: string, nodeId: number): Promise<NodeVersion[]> {
    const response = await apiClient.get<NodeVersion[]>(
      `/workspaces/${workspaceSlug}/nodes/${nodeId}/versions`
    );
    return response.data;
  },

  /**
   * Get specific version
   */
  async getVersion(
    workspaceSlug: string,
    nodeId: number,
    versionId: number
  ): Promise<NodeVersion> {
    const response = await apiClient.get<NodeVersion>(
      `/workspaces/${workspaceSlug}/nodes/${nodeId}/versions/${versionId}`
    );
    return response.data;
  },

  /**
   * Restore node to a previous version
   */
  async restoreVersion(
    workspaceSlug: string,
    nodeId: number,
    versionId: number
  ): Promise<Node> {
    const response = await apiClient.post<Node>(
      `/workspaces/${workspaceSlug}/nodes/${nodeId}/versions/${versionId}/restore`
    );
    return response.data;
  },
};
