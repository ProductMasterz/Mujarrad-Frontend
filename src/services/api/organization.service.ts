// src/services/api/organization.service.ts

import apiClient, { extractPage } from './client';
import type {
  Organization,
  OrganizationCreateRequest,
  OrganizationMember,
  OrganizationMemberRequest,
} from '@/types/backend-dtos';

/**
 * Organization Service
 * Handles all API calls related to organizations
 * Backend endpoints: /api/organizations/*
 */
export const organizationService = {
  /**
   * List all organizations for the current user
   * API Contract: GET /api/organizations
   * @returns Array of organizations
   */
  async listOrganizations(): Promise<Organization[]> {
    const response = await apiClient.get<any>('/organizations');
    return extractPage<Organization>(response.data);
  },

  /**
   * Get a single organization by ID
   * API Contract: GET /api/organizations/{id}
   * @param id - Organization UUID
   * @returns Organization object
   */
  async getOrganization(id: string): Promise<Organization> {
    const response = await apiClient.get<Organization>(`/organizations/${id}`);
    return response.data;
  },

  /**
   * Create a new organization
   * API Contract: POST /api/organizations
   * @param data - Organization creation data
   * @returns Created Organization object
   */
  async createOrganization(data: OrganizationCreateRequest): Promise<Organization> {
    const response = await apiClient.post<Organization>('/organizations', data);
    return response.data;
  },

  /**
   * Delete an organization
   * API Contract: DELETE /api/organizations/{id}?confirm=true
   * @param id - Organization UUID
   * @returns void
   */
  async deleteOrganization(id: string): Promise<void> {
    await apiClient.delete(`/organizations/${id}`, { params: { confirm: true } });
  },

  /**
   * List members of an organization
   * API Contract: GET /api/organizations/{id}/members
   * @param id - Organization UUID
   * @returns Array of organization members
   */
  async listMembers(id: string): Promise<OrganizationMember[]> {
    const response = await apiClient.get<any>(`/organizations/${id}/members`);
    return extractPage<OrganizationMember>(response.data);
  },

  /**
   * Add a member to an organization
   * API Contract: POST /api/organizations/{id}/members
   * @param id - Organization UUID
   * @param data - Member data
   * @returns void
   */
  async addMember(id: string, data: OrganizationMemberRequest): Promise<void> {
    await apiClient.post(`/organizations/${id}/members`, data);
  },

  /**
   * Remove a member from an organization
   * API Contract: DELETE /api/organizations/{id}/members/{userId}
   * @param id - Organization UUID
   * @param userId - User UUID to remove
   * @returns void
   */
  async removeMember(id: string, userId: string): Promise<void> {
    await apiClient.delete(`/organizations/${id}/members/${userId}`);
  },
};

// Export type for use in hooks and components
export type OrganizationService = typeof organizationService;
