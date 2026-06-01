'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Plus, Users, User } from 'lucide-react';
import { useOrganizations } from '@/hooks/api/useOrganizations';
import { useOrganizationStore } from '@/stores/organizationStore';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CreateOrgDialog } from './CreateOrgDialog';

export function OrgSwitcher() {
  const { data: orgs } = useOrganizations();
  const { selectedOrgId, setSelectedOrgId, setOrganizations, organizations } = useOrganizationStore();
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (orgs && orgs.length > 0) {
      setOrganizations(orgs);
    }
  }, [orgs, setOrganizations]);

  const selectedOrg = organizations.find((o) => o.id === selectedOrgId);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-muted">
          <div className="flex flex-1 items-center gap-2 overflow-hidden">
            {selectedOrg?.type === 'TEAM' ? (
              <Users className="size-4 shrink-0 text-muted-foreground" />
            ) : (
              <User className="size-4 shrink-0 text-muted-foreground" />
            )}
            <span className="truncate font-medium">{selectedOrg?.name ?? 'Select org'}</span>
            {selectedOrg && (
              <Badge variant="secondary" className="ml-auto text-[10px]">
                {selectedOrg.type}
              </Badge>
            )}
          </div>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[240px]">
          {organizations.map((org) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => setSelectedOrgId(org.id)}
              className="flex items-center gap-2"
            >
              {org.type === 'TEAM' ? <Users className="size-4" /> : <User className="size-4" />}
              <span className="flex-1 truncate">{org.name}</span>
              <Badge variant="outline" className="text-[10px]">
                {org.type}
              </Badge>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCreateOpen(true)} className="flex items-center gap-2">
            <Plus className="size-4" />
            <span>Create Team</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateOrgDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
