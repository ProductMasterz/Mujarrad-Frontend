import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Organization } from '@/types/backend-dtos';

interface OrganizationState {
  selectedOrgId: string | null;
  organizations: Organization[];
  setSelectedOrgId: (orgId: string | null) => void;
  setOrganizations: (orgs: Organization[]) => void;
  getSelectedOrg: () => Organization | null;
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set, get) => ({
      selectedOrgId: null,
      organizations: [],

      setSelectedOrgId: (orgId) => set({ selectedOrgId: orgId }),

      setOrganizations: (orgs) => {
        const state = get();
        const updates: Partial<OrganizationState> = { organizations: orgs };
        if (!state.selectedOrgId && orgs.length > 0) {
          const individual = orgs.find(o => o.type === 'INDIVIDUAL');
          updates.selectedOrgId = individual?.id ?? orgs[0].id;
        }
        set(updates);
      },

      getSelectedOrg: () => {
        const { selectedOrgId, organizations } = get();
        return organizations.find(o => o.id === selectedOrgId) ?? null;
      },
    }),
    { name: 'mujarrad-org' }
  )
);
