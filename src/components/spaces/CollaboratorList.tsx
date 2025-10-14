'use client';

import { useState } from 'react';
import { useCollaborators, useRemoveCollaborator } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { InviteCollaboratorDialog } from './InviteCollaboratorDialog';
import { isApiError } from '@/lib/errors';

interface CollaboratorListProps {
  spaceId: number;
  isOwner: boolean;
}

export function CollaboratorList({ spaceId, isOwner }: CollaboratorListProps) {
  const { data: collaborators, isLoading } = useCollaborators(spaceId);
  const { mutate: removeCollaborator, isPending: isRemoving } = useRemoveCollaborator(spaceId);
  const [selectedCollaboratorId, setSelectedCollaboratorId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = () => {
    if (!selectedCollaboratorId) return;

    removeCollaborator(selectedCollaboratorId, {
      onSuccess: () => {
        setSelectedCollaboratorId(null);
        setError(null);
      },
      onError: (err) => {
        if (isApiError(err)) {
          setError(err.getUserMessage());
        } else {
          setError('Failed to remove collaborator');
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!collaborators || collaborators.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">No collaborators yet</p>
        {isOwner && <InviteCollaboratorDialog spaceId={spaceId} />}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {collaborators.map((collaborator) => (
          <div
            key={collaborator.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {collaborator.userId.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium font-mono text-xs">{collaborator.userId}</p>
                <p className="text-xs text-muted-foreground">
                  Added {new Date(collaborator.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={collaborator.role === 'owner' ? 'default' : 'secondary'}>
                {collaborator.role}
              </Badge>
              {isOwner && collaborator.role !== 'owner' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCollaboratorId(collaborator.userId)}
                  disabled={isRemoving}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isOwner && (
        <div className="pt-2 border-t">
          <InviteCollaboratorDialog spaceId={spaceId} />
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog
        open={selectedCollaboratorId !== null}
        onOpenChange={(open: boolean) => !open && setSelectedCollaboratorId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Collaborator</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this collaborator? They will lose access to this space.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} disabled={isRemoving}>
              {isRemoving ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
