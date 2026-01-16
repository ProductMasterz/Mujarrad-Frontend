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
  spaceSlug: string;
  nodeId: string;
  nodeName: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  showTrigger?: boolean;
}

export function DeleteNodeDialog({
  spaceSlug,
  nodeId,
  nodeName,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  onSuccess,
  showTrigger = true,
}: DeleteNodeDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { mutate: deleteNode, isPending: isLoading } = useDeleteNode();

  // Use external state if provided, otherwise use internal state
  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (externalOnOpenChange) {
      externalOnOpenChange(value);
    }
    if (!isControlled) {
      setInternalOpen(value);
    }
  };

  const handleDelete = () => {
    deleteNode({ spaceSlug: spaceSlug, nodeId: nodeId }, {
      onSuccess: () => {
        setOpen(false);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/spaces/${spaceSlug}`);
        }
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
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="destructive">Delete Node</Button>
        </DialogTrigger>
      )}
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
