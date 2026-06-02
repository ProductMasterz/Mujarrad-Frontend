// src/services/api/node.service.ts

import apiClient, { extractPage } from './client';
import type {
  Node,
  CreateNodeRequest,
  UpdateNodeRequest,
  PageResponse,
  BlankCount,
  AssignFromBlankRequest,
  BulkAssignFromBlankRequest,
  MigrateNodeRequest,
  MigrateNodeResponse,
} from '@/types/backend-dtos';
import type { PaginatedResponse, PaginationParams, SearchParams } from '@/types/api';

/**
 * Node Service
 * Handles all API calls related to nodes
 * Backend endpoints: /api/spaces/{spaceSlug}/nodes/*
 *
 * IMPORTANT: All node operations are now space-scoped and require a spaceSlug parameter
 */
export const nodeService = {
  /**
   * Get all nodes in a space
   * API Contract: GET /api/spaces/{spaceSlug}/nodes
   * @param spaceSlug - Space slug (URL-friendly identifier)
   * @param params - Optional pagination parameters
   * @returns Paginated response with nodes
   */
  async getNodes(
    spaceSlug: string,
    params?: PaginationParams
  ): Promise<Node[]> {
    const paginationParams = { page: params?.page ?? 0, size: params?.size ?? 100, ...params };
    const response = await apiClient.get<PageResponse<Node>>(
      `/spaces/${spaceSlug}/nodes`,
      { params: paginationParams }
    );
    return extractPage<Node>(response.data);
  },

  /**
   * Get single node by ID (space-scoped)
   * API Contract: GET /api/spaces/{spaceSlug}/nodes/{nodeId}
   * @param spaceSlug - Space slug (URL-friendly identifier)
   * @param nodeId - Node UUID
   * @returns Single Node object
   */
  async getNode(spaceSlug: string, nodeId: string): Promise<Node> {
    const response = await apiClient.get<Node>(`/spaces/${spaceSlug}/nodes/${nodeId}`);
    return response.data;
  },

  /**
   * @deprecated Use createNodeInContext instead. Flat creation lands nodes in The Blank.
   * API Contract: POST /api/spaces/{spaceSlug}/nodes
   * @param spaceSlug - Space slug (URL-friendly identifier)
   * @param data - Node creation data
   * @returns Created Node object
   */
  async createNode(spaceSlug: string, data: CreateNodeRequest): Promise<Node> {
    const response = await apiClient.post<Node>(`/spaces/${spaceSlug}/nodes`, data);
    return response.data;
  },

  /**
   * Update node (space-scoped)
   * API Contract: PUT /api/spaces/{spaceSlug}/nodes/{nodeId}
   * @param spaceSlug - Space slug (URL-friendly identifier)
   * @param nodeId - Node UUID
   * @param data - Node update data
   * @returns Updated Node object
   */
  async updateNode(
    spaceSlug: string,
    nodeId: string,
    data: UpdateNodeRequest
  ): Promise<Node> {
    const response = await apiClient.put<Node>(
      `/spaces/${spaceSlug}/nodes/${nodeId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete node (space-scoped)
   * API Contract: DELETE /api/spaces/{spaceSlug}/nodes/{nodeId}?force={boolean}
   * @param spaceSlug - Space slug (URL-friendly identifier)
   * @param nodeId - Node UUID
   * @param force - Optional force delete parameter
   * @returns void (200 OK)
   */
  async deleteNode(spaceSlug: string, nodeId: string, force?: boolean): Promise<void> {
    const params = force !== undefined ? { force } : undefined;
    await apiClient.delete(`/spaces/${spaceSlug}/nodes/${nodeId}`, { params });
  },

  // ---------------------------------------------------------------------------
  // Context-Scoped Node Access (RECOMMENDED)
  // ---------------------------------------------------------------------------

  async createNodeInContext(
    spaceSlug: string,
    contextSlug: string,
    data: CreateNodeRequest
  ): Promise<Node> {
    const response = await apiClient.post<Node>(
      `/spaces/${spaceSlug}/contexts/${contextSlug}/nodes`,
      data
    );
    return response.data;
  },

  async getNodesInContext(
    spaceSlug: string,
    contextSlug: string,
    params?: PaginationParams
  ): Promise<Node[]> {
    const paginationParams = { page: params?.page ?? 0, size: params?.size ?? 100, ...params };
    const response = await apiClient.get<PageResponse<Node>>(
      `/spaces/${spaceSlug}/contexts/${contextSlug}/nodes`,
      { params: paginationParams }
    );
    return extractPage<Node>(response.data);
  },

  async createNestedContext(
    spaceSlug: string,
    parentContextSlug: string,
    data: CreateNodeRequest
  ): Promise<Node> {
    const response = await apiClient.post<Node>(
      `/spaces/${spaceSlug}/contexts/${parentContextSlug}/contexts`,
      data
    );
    return response.data;
  },

  async getChildContexts(
    spaceSlug: string,
    contextSlug: string,
    params?: PaginationParams
  ): Promise<Node[]> {
    const paginationParams = { page: params?.page ?? 0, size: params?.size ?? 100, ...params };
    const response = await apiClient.get<PageResponse<Node>>(
      `/spaces/${spaceSlug}/contexts/${contextSlug}/children`,
      { params: paginationParams }
    );
    return extractPage<Node>(response.data);
  },

  // ---------------------------------------------------------------------------
  // The Blank (unorganized nodes)
  // ---------------------------------------------------------------------------

  async getBlankNodes(
    spaceSlug: string,
    params?: PaginationParams
  ): Promise<Node[]> {
    const paginationParams = { page: params?.page ?? 0, size: params?.size ?? 100, ...params };
    const response = await apiClient.get<PageResponse<Node>>(
      `/spaces/${spaceSlug}/blank`,
      { params: paginationParams }
    );
    return extractPage<Node>(response.data);
  },

  async getBlankCount(spaceSlug: string): Promise<number> {
    const response = await apiClient.get<BlankCount>(
      `/spaces/${spaceSlug}/blank/count`
    );
    return response.data.count;
  },

  async assignFromBlank(
    spaceSlug: string,
    nodeId: string,
    contextSlug: string
  ): Promise<Node> {
    const response = await apiClient.post<Node>(
      `/spaces/${spaceSlug}/blank/${nodeId}/assign`,
      { contextSlug }
    );
    return response.data;
  },

  async bulkAssignFromBlank(
    spaceSlug: string,
    nodeIds: string[],
    contextSlug: string
  ): Promise<void> {
    await apiClient.post(
      `/spaces/${spaceSlug}/blank/assign-bulk`,
      { nodeIds, contextSlug } as BulkAssignFromBlankRequest
    );
  },

  // ---------------------------------------------------------------------------
  // Child Nodes (blocks inside pages)
  // ---------------------------------------------------------------------------

  async createChildNode(
    spaceSlug: string,
    parentNodeId: string,
    data: CreateNodeRequest
  ): Promise<Node> {
    const response = await apiClient.post<Node>(
      `/spaces/${spaceSlug}/nodes/${parentNodeId}/children`,
      data
    );
    return response.data;
  },

  async getChildNodes(
    spaceSlug: string,
    parentNodeId: string,
    params?: PaginationParams
  ): Promise<Node[]> {
    const paginationParams = { page: params?.page ?? 0, size: params?.size ?? 100, ...params };
    const response = await apiClient.get<any>(
      `/spaces/${spaceSlug}/nodes/${parentNodeId}/children`,
      { params: paginationParams }
    );
    return extractPage<Node>(response.data);
  },

  async reorderChildren(
    spaceSlug: string,
    parentNodeId: string,
    nodeIds: string[]
  ): Promise<void> {
    await apiClient.patch(
      `/spaces/${spaceSlug}/nodes/${parentNodeId}/children/reorder`,
      { nodeIds }
    );
  },

  // ---------------------------------------------------------------------------
  // Node Migration (replaces move)
  // ---------------------------------------------------------------------------

  async migrateNode(
    spaceSlug: string,
    nodeId: string,
    data: MigrateNodeRequest
  ): Promise<MigrateNodeResponse> {
    const response = await apiClient.post<MigrateNodeResponse>(
      `/spaces/${spaceSlug}/nodes/${nodeId}/migrate`,
      data
    );
    return response.data;
  },

  /**
   * Search nodes in a space
   * API Contract: GET /api/spaces/{spaceSlug}/search
   * @param spaceSlug - Space slug (URL-friendly identifier)
   * @param params - Search parameters
   * @returns Paginated response with matching nodes
   */
  async searchNodes(
    spaceSlug: string,
    params: SearchParams
  ): Promise<PaginatedResponse<Node>> {
    const response = await apiClient.get<PaginatedResponse<Node>>(
      `/spaces/${spaceSlug}/search`,
      { params }
    );
    return response.data;
  },
};

// Export type for use in hooks and components
export type NodeService = typeof nodeService;
