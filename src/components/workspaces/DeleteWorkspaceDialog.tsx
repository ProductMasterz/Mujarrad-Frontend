'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeleteWorkspace } from '@/hooks/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { isApiError } from '@/lib/errors';

interface DeleteWorkspaceDialogProps {
  workspaceId: number;
  workspaceName: string;
}

export function DeleteWorkspaceDialog({ workspaceId, workspaceName }: DeleteWorkspaceDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { mutate: deleteWorkspace, isPending: isLoading } = useDeleteWorkspace();

  const handleDelete = () => {
    deleteWorkspace(workspaceId, {
      onSuccess: () => {
        setOpen(false);
        router.push('/workspaces');
      },
      onError: (err) => {
        if (isApiError(err)) {
          setError(err.getUserMessage());
        } else {
          setError('Failed to delete workspace');
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Workspace</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Workspace</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{workspaceName}</strong>?
            This will delete all nodes and relationships. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete Workspace'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
