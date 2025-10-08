'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeleteNode } from '@/hooks/api';
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

interface DeleteNodeDialogProps {
  workspaceSlug: string;
  nodeId: number;
  nodeName: string;
}

export function DeleteNodeDialog({ workspaceSlug, nodeId, nodeName }: DeleteNodeDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { mutate: deleteNode, isPending: isLoading } = useDeleteNode();

  const handleDelete = () => {
    deleteNode(nodeId.toString(), {
      onSuccess: () => {
        setOpen(false);
        router.push(`/workspaces/${workspaceSlug}/nodes`);
      },
      onError: (err) => {
        if (isApiError(err)) {
          setError(err.getUserMessage());
        } else {
          setError('Failed to delete node');
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Node</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Node</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{nodeName}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
