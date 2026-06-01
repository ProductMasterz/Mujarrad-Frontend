// src/services/api/version.service.ts

import apiClient, { extractPage } from './client';
import type { NodeVersion, Node } from '@/types/backend-dtos';

export const versionService = {
  async getNodeVersions(spaceSlug: string, nodeId: string): Promise<NodeVersion[]> {
    const response = await apiClient.get<any>(
      `/spaces/${spaceSlug}/nodes/${nodeId}/versions`
    );
    return extractPage<NodeVersion>(response.data);
  },

  async getVersion(
    spaceSlug: string,
    nodeId: string,
    versionId: number
  ): Promise<NodeVersion> {
    const response = await apiClient.get<NodeVersion>(
      `/spaces/${spaceSlug}/nodes/${nodeId}/versions/${versionId}`
    );
    return response.data;
  },

  async restoreVersion(
    spaceSlug: string,
    nodeId: string,
    versionId: number
  ): Promise<Node> {
    const response = await apiClient.post<Node>(
      `/spaces/${spaceSlug}/nodes/${nodeId}/versions/${versionId}/restore`
    );
    return response.data;
  },

  async deleteVersion(
    spaceSlug: string,
    nodeId: string,
    versionId: number
  ): Promise<void> {
    await apiClient.delete(
      `/spaces/${spaceSlug}/nodes/${nodeId}/versions/${versionId}`
    );
  },
};
