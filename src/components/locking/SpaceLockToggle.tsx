'use client';

import { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useLockSpace, useUnlockSpace } from '@/hooks/api/useLocking';

interface SpaceLockToggleProps {
  spaceSlug: string;
  isLocked: boolean;
  onLockChanged?: () => void;
}

export function SpaceLockToggle({ spaceSlug, isLocked, onLockChanged }: SpaceLockToggleProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const lockSpace = useLockSpace();
  const unlockSpace = useUnlockSpace();

  const isPending = lockSpace.isPending || unlockSpace.isPending;

  const handleClick = () => {
    if (isLocked) {
      unlockSpace.mutate({ spaceSlug }, { onSuccess: onLockChanged });
    } else {
      setShowConfirm(true);
    }
  };

  const handleConfirmLock = () => {
    lockSpace.mutate({ spaceSlug }, { onSuccess: () => {
      setShowConfirm(false);
      onLockChanged?.();
    }});
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 rounded-xl"
        onClick={handleClick}
        disabled={isPending}
      >
        {isPending ? (
          <Spinner size="sm" />
        ) : isLocked ? (
          <Unlock className="h-4 w-4 text-red-500" />
        ) : (
          <Lock className="h-4 w-4" />
        )}
        {isLocked ? 'Unlock Space' : 'Lock Space'}
      </Button>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lock this space?</DialogTitle>
            <DialogDescription>
              Locking a space blocks ALL writes. No nodes can be created, edited, or deleted until the space is unlocked.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmLock} disabled={lockSpace.isPending}>
              {lockSpace.isPending ? <Spinner size="sm" /> : 'Lock Space'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
