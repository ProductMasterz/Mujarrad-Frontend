// src/services/api/virtual-context.service.ts

import apiClient from './client';
import type {
  VirtualContext,
  VirtualContextCreateRequest,
  VirtualContextMember,
  VirtualContextAddMemberRequest,
  CrossSpaceAttributeResponse,
  CrossSpaceAttributeCreateRequest,
} from '@/types/backend-dtos';

/**
 * Virtual Context Service
 * Handles all API calls related to virtual contexts (cross-space connections)
 * Backend endpoints: /api/virtual-contexts/*
 */
export const virtualContextService = {
  /**
   * List all virtual contexts for the current user
   * API Contract: GET /api/virtual-contexts
   * @returns Array of virtual contexts
   */
  async listVirtualContexts(): Promise<VirtualContext[]> {
    const response = await apiClient.get<VirtualContext[]>('/virtual-contexts');
    return response.data;
  },

  /**
   * Get a single virtual context by ID
   * API Contract: GET /api/virtual-contexts/{id}
   * @param id - Virtual context UUID
   * @returns VirtualContext object
   */
  async getVirtualContext(id: string): Promise<VirtualContext> {
    const response = await apiClient.get<VirtualContext>(`/virtual-contexts/${id}`);
    return response.data;
  },

  /**
   * Create a new virtual context
   * API Contract: POST /api/virtual-contexts
   * @param data - Virtual context creation data
   * @returns Created VirtualContext object
   */
  async createVirtualContext(data: VirtualContextCreateRequest): Promise<VirtualContext> {
    const response = await apiClient.post<VirtualContext>('/virtual-contexts', data);
    return response.data;
  },

  /**
   * Delete a virtual context
   * API Contract: DELETE /api/virtual-contexts/{id}
   * @param id - Virtual context UUID
   * @returns void
   */
  async deleteVirtualContext(id: string): Promise<void> {
    await apiClient.delete(`/virtual-contexts/${id}`);
  },

  /**
   * List members of a virtual context
   * API Contract: GET /api/virtual-contexts/{id}/members
   * @param id - Virtual context UUID
   * @returns Array of virtual context members
   */
  async listMembers(id: string): Promise<VirtualContextMember[]> {
    const response = await apiClient.get<VirtualContextMember[]>(`/virtual-contexts/${id}/members`);
    return response.data;
  },

  /**
   * Add a member to a virtual context
   * API Contract: POST /api/virtual-contexts/{id}/members
   * @param id - Virtual context UUID
   * @param data - Member data
   * @returns void
   */
  async addMember(id: string, data: VirtualContextAddMemberRequest): Promise<void> {
    await apiClient.post(`/virtual-contexts/${id}/members`, data);
  },

  /**
   * List cross-space attributes in a virtual context
   * API Contract: GET /api/virtual-contexts/{id}/attributes
   * @param id - Virtual context UUID
   * @returns Array of cross-space attributes
   */
  async listCrossSpaceAttributes(id: string): Promise<CrossSpaceAttributeResponse[]> {
    const response = await apiClient.get<CrossSpaceAttributeResponse[]>(
      `/virtual-contexts/${id}/attributes`
    );
    return response.data;
  },

  /**
   * Create a cross-space attribute in a virtual context
   * API Contract: POST /api/virtual-contexts/{id}/attributes
   * @param id - Virtual context UUID
   * @param data - Cross-space attribute creation data
   * @returns Created cross-space attribute
   */
  async createCrossSpaceAttribute(
    id: string,
    data: CrossSpaceAttributeCreateRequest
  ): Promise<CrossSpaceAttributeResponse> {
    const response = await apiClient.post<CrossSpaceAttributeResponse>(
      `/virtual-contexts/${id}/attributes`,
      data
    );
    return response.data;
  },

  /**
   * Get cross-space attributes for a specific node
   * API Contract: GET /api/nodes/{nodeId}/cross-space-attributes
   * @param nodeId - Node UUID
   * @returns Array of cross-space attributes
   */
  async getNodeCrossSpaceAttributes(nodeId: string): Promise<CrossSpaceAttributeResponse[]> {
    const response = await apiClient.get<CrossSpaceAttributeResponse[]>(
      `/nodes/${nodeId}/cross-space-attributes`
    );
    return response.data;
  },
};

// Export type for use in hooks and components
export type VirtualContextService = typeof virtualContextService;
