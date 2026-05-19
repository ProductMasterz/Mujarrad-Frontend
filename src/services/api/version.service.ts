// src/services/api/version.service.ts

import apiClient from './client';
import type { NodeVersion, Node } from '@/types/backend-dtos';

export const versionService = {
  /**
   * Get all versions for a node
   */
  async getNodeVersions(spaceSlug: string, nodeId: number): Promise<NodeVersion[]> {
    const response = await apiClient.get<NodeVersion[]>(
      `/spaces/${spaceSlug}/nodes/${nodeId}/versions`
    );
    return response.data;
  },

  /**
   * Get specific version
   */
  async getVersion(
    spaceSlug: string,
    nodeId: number,
    versionId: number
  ): Promise<NodeVersion> {
    const response = await apiClient.get<NodeVersion>(
      `/spaces/${spaceSlug}/nodes/${nodeId}/versions/${versionId}`
    );
    return response.data;
  },

  /**
   * Restore node to a previous version
   * Creates a new version with the historical content
   */
  async restoreVersion(
    spaceSlug: string,
    nodeId: number,
    versionId: number
  ): Promise<Node> {
    const response = await apiClient.post<Node>(
      `/spaces/${spaceSlug}/nodes/${nodeId}/versions/${versionId}/restore`
    );
    return response.data;
  },

  /**
   * Delete a specific version from history
   */
  async deleteVersion(
    spaceSlug: string,
    nodeId: number,
    versionId: number
  ): Promise<void> {
    await apiClient.delete(
      `/spaces/${spaceSlug}/nodes/${nodeId}/versions/${versionId}`
    );
  },
};
