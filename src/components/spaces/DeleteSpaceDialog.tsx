'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeleteSpace } from '@/hooks/api';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isApiError } from '@/lib/errors';

interface DeleteSpaceDialogProps {
  spaceId: number;
  spaceName: string;
  nodeCount?: number;
  relationshipCount?: number;
  versionCount?: number;
}

export function DeleteSpaceDialog({
  spaceId,
  spaceName,
  nodeCount = 0,
  relationshipCount = 0,
  versionCount = 0
}: DeleteSpaceDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { mutate: deleteSpace, isPending: isLoading } = useDeleteSpace();

  const isConfirmed = confirmationText === spaceName;

  const handleDelete = () => {
    if (!isConfirmed) return;

    deleteSpace(spaceId, {
      onSuccess: () => {
        setOpen(false);
        setConfirmationText('');
        router.push('/spaces');
      },
      onError: (err) => {
        if (isApiError(err)) {
          setError(err.getUserMessage());
        } else {
          setError('Failed to delete space');
        }
      },
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setConfirmationText('');
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Space</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Space</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the space and all its contents.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-md bg-destructive/10 p-4 text-sm">
            <p className="font-semibold text-destructive mb-2">This will delete:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>{nodeCount} {nodeCount === 1 ? 'node' : 'nodes'}</li>
              <li>{relationshipCount} {relationshipCount === 1 ? 'relationship' : 'relationships'}</li>
              <li>{versionCount} version {versionCount === 1 ? 'entry' : 'entries'}</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmation">
              Type <strong>{spaceName}</strong> to confirm:
            </Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={spaceName}
              autoComplete="off"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading || !isConfirmed}
          >
            {isLoading ? 'Deleting...' : 'Delete Space'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
