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
import { useCreateVirtualContext } from '@/hooks/api';
import { useNotificationStore } from '@/stores/notificationStore';

interface CreateVCDialogProps {
  ownerSpaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateVCDialog({ ownerSpaceId, open, onOpenChange }: CreateVCDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const addNotification = useNotificationStore((state) => state.addNotification);
  const createVC = useCreateVirtualContext();

  const handleCreate = () => {
    if (!name.trim()) return;

    createVC.mutate(
      { name: name.trim(), ownerSpaceId, description: description.trim() || undefined },
      {
        onSuccess: () => {
          addNotification({
            type: 'success',
            source: 'node',
            title: `Created connection "${name.trim()}"`,
          });
          setName('');
          setDescription('');
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Connection</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Connection name"
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this connection do?"
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim() || createVC.isPending}>
            {createVC.isPending ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
