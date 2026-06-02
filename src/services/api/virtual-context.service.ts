// src/services/api/virtual-context.service.ts

import apiClient, { extractPage } from './client';
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
 *
 * Backend endpoints:
 * GET    /api/virtual-contexts
 * POST   /api/virtual-contexts
 * GET    /api/virtual-contexts/{id}
 * DELETE /api/virtual-contexts/{id}
 * GET    /api/virtual-contexts/{id}/members
 * POST   /api/virtual-contexts/{id}/members
 * GET    /api/virtual-contexts/{id}/attributes
 * POST   /api/virtual-contexts/{id}/attributes
 * GET    /api/nodes/{nodeId}/cross-space-attributes
 */
export const virtualContextService = {
  /**
   * List all virtual contexts for the current user.
   * Backend returns a paginated response, so we extract content.
   */
  async listVirtualContexts(params?: {
    page?: number;
    size?: number;
  }): Promise<VirtualContext[]> {
    const response = await apiClient.get<any>('/virtual-contexts', {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 1000,
      },
    });

    return extractPage<VirtualContext>(response.data);
  },

  /**
   * Get a single virtual context by ID.
   */
  async getVirtualContext(id: string): Promise<VirtualContext> {
    const response = await apiClient.get<VirtualContext>(`/virtual-contexts/${id}`);
    return response.data;
  },

  /**
   * Create a new virtual context / connection.
   */
  async createVirtualContext(
    data: VirtualContextCreateRequest
  ): Promise<VirtualContext> {
    const response = await apiClient.post<VirtualContext>(
      '/virtual-contexts',
      data
    );

    return response.data;
  },

  /**
   * Delete a virtual context / connection.
   */
  async deleteVirtualContext(id: string): Promise<void> {
    await apiClient.delete(`/virtual-contexts/${id}`);
  },

  /**
   * List member spaces of a virtual context.
   * Backend returns a paginated response.
   */
  async listMembers(
    id: string,
    params?: {
      page?: number;
      size?: number;
    }
  ): Promise<VirtualContextMember[]> {
    const response = await apiClient.get<any>(`/virtual-contexts/${id}/members`, {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 1000,
      },
    });

    return extractPage<VirtualContextMember>(response.data);
  },

  /**
   * Add a space as member to a virtual context.
   */
  async addMember(
    id: string,
    data: VirtualContextAddMemberRequest
  ): Promise<void> {
    await apiClient.post(`/virtual-contexts/${id}/members`, data);
  },

  /**
   * Add many spaces as members to a virtual context.
   * Useful after creating a connection from the UI.
   */
  async addMembers(
    id: string,
    members: VirtualContextAddMemberRequest[]
  ): Promise<void> {
    await Promise.all(
      members.map((member) => this.addMember(id, member))
    );
  },

  /**
   * Create a virtual context and immediately add selected member spaces.
   * This is the best method for CreateVCDialog.
   */
  async createVirtualContextWithMembers(data: {
    name: string;
    description?: string;
    ownerSpaceId: string;
    visibility?: string;
    members?: VirtualContextAddMemberRequest[];
  }): Promise<VirtualContext> {
    const { members = [], ...createData } = data;

    const virtualContext = await this.createVirtualContext(createData);

    const uniqueMembers = members.filter(
      (member, index, array) =>
        member.spaceId !== createData.ownerSpaceId &&
        array.findIndex((item) => item.spaceId === member.spaceId) === index
    );

    if (uniqueMembers.length > 0) {
      await this.addMembers(virtualContext.id, uniqueMembers);
    }

    return virtualContext;
  },

  /**
   * List cross-space attributes inside a virtual context.
   * Backend returns PageResponseCrossSpaceAttributeResponse,
   * so do NOT return response.data directly.
   */
  async listCrossSpaceAttributes(
    id: string,
    params?: {
      page?: number;
      size?: number;
    }
  ): Promise<CrossSpaceAttributeResponse[]> {
    const response = await apiClient.get<any>(
      `/virtual-contexts/${id}/attributes`,
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 1000,
        },
      }
    );

    return extractPage<CrossSpaceAttributeResponse>(response.data);
  },

  /**
   * Create a cross-space attribute / relationship inside a virtual context.
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
   * Get all cross-space attributes linked to a specific node.
   * Backend returns a paginated response.
   */
  async getNodeCrossSpaceAttributes(
    nodeId: string,
    params?: {
      page?: number;
      size?: number;
    }
  ): Promise<CrossSpaceAttributeResponse[]> {
    const response = await apiClient.get<any>(
      `/nodes/${nodeId}/cross-space-attributes`,
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 1000,
        },
      }
    );

    return extractPage<CrossSpaceAttributeResponse>(response.data);
  },

  /**
   * Helper: returns only virtual contexts relevant to the current space.
   * A connection is relevant if:
   * 1. current space is ownerSpaceId
   * 2. OR current space exists in its members list
   */
  async listVirtualContextsForSpace(spaceId: string): Promise<
    Array<
      VirtualContext & {
        members: VirtualContextMember[];
        memberCount: number;
        isOwner: boolean;
        isMember: boolean;
      }
    >
  > {
    const virtualContexts = await this.listVirtualContexts();

    const enriched = await Promise.all(
      virtualContexts.map(async (vc) => {
        let members: VirtualContextMember[] = [];

        try {
          members = await this.listMembers(vc.id);
        } catch (error) {
          console.error(
            `[virtualContextService] Failed to load members for VC ${vc.id}`,
            error
          );
        }

        const isOwner = vc.ownerSpaceId === spaceId;
        const isMember = members.some((member) => member.spaceId === spaceId);

        return {
          ...vc,
          members,
          memberCount: members.length + 1, // +1 for owner space
          isOwner,
          isMember,
        };
      })
    );

    return enriched.filter((vc) => vc.isOwner || vc.isMember);
  },
};

// Export type for use in hooks and components
export type VirtualContextService = typeof virtualContextService;