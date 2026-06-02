'use client';

import { useState } from 'react';
import { useVirtualContexts, useDeleteVirtualContext } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/stores/notificationStore';
import { CreateVCDialog } from './CreateVCDialog';

interface VCPanelProps {
  spaceSlug: string;
  spaceId: string;
}

export function VCPanel({ spaceSlug, spaceId }: VCPanelProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const { data: virtualContexts = [], isLoading } = useVirtualContexts();
  const deleteVC = useDeleteVirtualContext();

  const handleDelete = (vcId: string, name: string) => {
    deleteVC.mutate(vcId, {
      onSuccess: () => {
        addNotification({
          type: 'success',
          source: 'node',
          title: `Deleted connection "${name}"`,
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const vcList = Array.isArray(virtualContexts) ? virtualContexts : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Connections
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCreateDialog(true)}
        >
          Create Connection
        </Button>
      </div>

      {vcList.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No cross-space connections
        </p>
      ) : (
        <div className="space-y-2">
          {vcList.map((vc: { id: string; name: string; memberCount?: number }) => (
            <div
              key={vc.id}
              className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3"
            >
              <div>
                <div className="text-sm font-medium text-foreground">{vc.name}</div>
                <div className="text-xs text-muted-foreground">
                  {vc.memberCount ?? 0} member{(vc.memberCount ?? 0) !== 1 ? 's' : ''}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDelete(vc.id, vc.name)}
                disabled={deleteVC.isPending}
              >
                Delete
              </Button>
            </div>
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
