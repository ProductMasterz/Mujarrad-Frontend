'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSpaces } from '@/hooks/api';
import { useMigrateNode } from '@/hooks/api';
import { useNotificationStore } from '@/stores/notificationStore';

interface MigrateNodeDialogProps {
  spaceSlug: string;
  nodeId: string;
  nodeTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MigrateNodeDialog({
  spaceSlug,
  nodeId,
  nodeTitle,
  open,
  onOpenChange,
}: MigrateNodeDialogProps) {
  const [targetSpaceId, setTargetSpaceId] = useState('');
  const [includeReference, setIncludeReference] = useState(true);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const { data: spaces = [] } = useSpaces();
  const migrateNode = useMigrateNode();

  const handleMigrate = () => {
    if (!targetSpaceId) return;

    migrateNode.mutate(
      { spaceSlug, nodeId, data: { targetSpaceId, includeReference } },
      {
        onSuccess: () => {
          addNotification({
            type: 'success',
            source: 'node',
            title: `Migrated "${nodeTitle}"`,
          });
          onOpenChange(false);
        },
        onError: () => {
          addNotification({
            type: 'error',
            source: 'node',
            title: `Failed to migrate "${nodeTitle}"`,
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Migrate Node</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Target Space
            </label>
            <select
              value={targetSpaceId}
              onChange={(e) => setTargetSpaceId(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="">Select a space...</option>
              {(Array.isArray(spaces) ? spaces : [])
                .filter((s) => s.slug !== spaceSlug)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={includeReference}
              onChange={(e) => setIncludeReference(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Include reference link
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleMigrate}
            disabled={!targetSpaceId || migrateNode.isPending}
          >
            {migrateNode.isPending ? 'Migrating...' : 'Migrate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
