'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAddVCMember, useCreateVirtualContext } from '@/hooks/api';
import { useNotificationStore } from '@/stores/notificationStore';
import { spaceService } from '@/services/api';
import type { Space } from '@/types/backend-dtos';

interface CreateVCDialogProps {
  ownerSpaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateVCDialog({
  ownerSpaceId,
  open,
  onOpenChange,
}: CreateVCDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpaceIds, setSelectedSpaceIds] = useState<string[]>([]);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);

  const addNotification = useNotificationStore((state) => state.addNotification);

  const createVC = useCreateVirtualContext();
  const addMember = useAddVCMember();

  useEffect(() => {
    if (!open) return;

    setIsLoadingSpaces(true);

    spaceService
      .getSpaces()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setSpaces(list.filter((space) => space.id !== ownerSpaceId));
      })
      .catch((error) => {
        console.error('[CreateVCDialog] Failed to load spaces:', error);

        addNotification({
          type: 'error',
          source: 'space',
          title: 'Failed to load spaces',
          description:
            error instanceof Error
              ? error.message
              : 'Could not load spaces for this connection.',
        });
      })
      .finally(() => {
        setIsLoadingSpaces(false);
      });
  }, [open, ownerSpaceId, addNotification]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setSelectedSpaceIds([]);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }

    onOpenChange(nextOpen);
  };

  const toggleSpace = (spaceId: string) => {
    setSelectedSpaceIds((prev) =>
      prev.includes(spaceId)
        ? prev.filter((id) => id !== spaceId)
        : [...prev, spaceId]
    );
  };

  const handleCreate = () => {
    const trimmedName = name.trim();

    if (!trimmedName) return;

    createVC.mutate(
      {
        name: trimmedName,
        ownerSpaceId,
        description: description.trim() || undefined,
      },
      {
        onSuccess: async (createdVC) => {
          try {
            await Promise.all(
              selectedSpaceIds.map((spaceId) =>
                addMember.mutateAsync({
                  vcId: createdVC.id,
                  spaceId,
                  role: 'CONTRIBUTOR',
                })
              )
            );

            addNotification({
              type: 'success',
              source: 'node',
              title: `Created connection "${trimmedName}"`,
              description:
                selectedSpaceIds.length > 0
                  ? `Connected ${selectedSpaceIds.length} space(s).`
                  : 'Connection created without additional spaces.',
            });

            resetForm();
            onOpenChange(false);
          } catch (error) {
            console.error('[CreateVCDialog] Failed to add members:', error);

            addNotification({
              type: 'error',
              source: 'node',
              title: 'Connection created, but member assignment failed',
              description:
                error instanceof Error
                  ? error.message
                  : 'Could not add the selected spaces.',
            });
          }
        },
        onError: (error) => {
          console.error('[CreateVCDialog] Failed to create connection:', error);

          addNotification({
            type: 'error',
            source: 'node',
            title: 'Failed to create connection',
            description:
              error instanceof Error
                ? error.message
                : 'Could not create this connection.',
          });
        },
      }
    );
  };

  const isCreating = createVC.isPending || addMember.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Connection</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
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
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What does this connection do?"
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Connect spaces
            </label>

            {isLoadingSpaces ? (
              <div className="flex items-center justify-center rounded-xl border border-border bg-muted/20 px-3 py-6">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : spaces.length === 0 ? (
              <p className="rounded-xl border border-border bg-muted/20 px-3 py-3 text-sm text-muted-foreground">
                No other spaces available.
              </p>
            ) : (
              <div className="max-h-[180px] space-y-2 overflow-y-auto rounded-xl border border-border bg-background p-2">
                {spaces.map((space) => (
                  <label
                    key={space.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSpaceIds.includes(space.id)}
                      onChange={() => toggleSpace(space.id)}
                      className="h-4 w-4 rounded border-border"
                    />

                    <div className="min-w-0">
                      <div className="truncate font-medium text-foreground">
                        {space.name}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {space.slug}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>

          <Button
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
          >
            {isCreating ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}