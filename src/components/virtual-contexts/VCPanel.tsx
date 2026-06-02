'use client';

import { useState } from 'react';
import {
  useDeleteVirtualContext,
  useVCMembers,
  useVirtualContextsForSpace,
} from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/stores/notificationStore';
import { CreateVCDialog } from './CreateVCDialog';
import type { VirtualContext, VirtualContextMember } from '@/types/backend-dtos';

interface VCPanelProps {
  spaceSlug: string;
  spaceId: string;
}

type VCConnectionRowProps = {
  vc: VirtualContext;
  currentSpaceId: string;
  onDelete: (vcId: string, name: string) => void;
  isDeleting: boolean;
};

function VCConnectionRow({
  vc,
  currentSpaceId,
  onDelete,
  isDeleting,
}: VCConnectionRowProps) {
  const { data: members = [], isLoading: membersLoading } = useVCMembers(vc.id);

  const memberList = Array.isArray(members) ? members : [];

  const isOwner = vc.ownerSpaceId === currentSpaceId;

  const memberCount = memberList.length;

  const connectedSpacesText = membersLoading
    ? 'Loading connected spaces...'
    : `${memberCount} connected space${memberCount !== 1 ? 's' : ''}`;

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div className="truncate text-sm font-medium text-foreground">
            {vc.name}
          </div>

          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {isOwner ? 'Owner' : 'Member'}
          </span>
        </div>

        <div className="mt-0.5 text-xs text-muted-foreground">
          {connectedSpacesText}
        </div>

        {vc.description && (
          <div className="mt-1 line-clamp-2 text-xs text-muted-foreground/80">
            {vc.description}
          </div>
        )}

        {!membersLoading && memberList.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {memberList.map((member: VirtualContextMember) => (
              <span
                key={member.spaceId}
                className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {member.spaceName}
              </span>
            ))}
          </div>
        )}
      </div>

      {isOwner && (
        <Button
          variant="ghost"
          size="sm"
          className="ml-3 shrink-0 text-destructive hover:text-destructive"
          onClick={() => onDelete(vc.id, vc.name)}
          disabled={isDeleting}
        >
          Delete
        </Button>
      )}
    </div>
  );
}

export function VCPanel({ spaceSlug, spaceId }: VCPanelProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const addNotification = useNotificationStore((state) => state.addNotification);

  const {
    data: virtualContexts = [],
    isLoading,
    error,
  } = useVirtualContextsForSpace(spaceId);

  const deleteVC = useDeleteVirtualContext();

  const vcList = Array.isArray(virtualContexts) ? virtualContexts : [];

  const handleDelete = (vcId: string, name: string) => {
    deleteVC.mutate(vcId, {
      onSuccess: () => {
        addNotification({
          type: 'success',
          source: 'node',
          title: `Deleted connection "${name}"`,
        });
      },
      onError: (error) => {
        console.error('[VCPanel] Failed to delete connection:', error);

        addNotification({
          type: 'error',
          source: 'node',
          title: 'Failed to delete connection',
          description:
            error instanceof Error
              ? error.message
              : 'Could not delete this connection.',
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3" data-space-slug={spaceSlug}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Connections
            </h3>
            <p className="mt-1 text-xs text-destructive">
              Failed to load connections.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateDialog(true)}
          >
            Create Connection
          </Button>
        </div>

        <CreateVCDialog
          ownerSpaceId={spaceId}
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3" data-space-slug={spaceSlug}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Connections
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Cross-space groups where this space is an owner or member.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCreateDialog(true)}
        >
          Create Connection
        </Button>
      </div>

      {vcList.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-5 text-center text-sm text-muted-foreground">
          No cross-space connections.
        </p>
      ) : (
        <div className="max-h-[220px] space-y-2 overflow-y-auto pr-1">
          {vcList.map((vc) => (
            <VCConnectionRow
              key={vc.id}
              vc={vc}
              currentSpaceId={spaceId}
              onDelete={handleDelete}
              isDeleting={deleteVC.isPending}
            />
          ))}
        </div>
      )}

      <CreateVCDialog
        ownerSpaceId={spaceId}
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}