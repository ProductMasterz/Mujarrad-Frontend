'use client';

import { useState } from 'react';
import { Shield, ShieldOff } from 'lucide-react';
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
          <ShieldOff className="h-4 w-4 text-purple-500" />
        ) : (
          <Shield className="h-4 w-4 text-purple-500" />
        )}
        {isLocked ? 'Unlock Schema' : 'Lock Schema'}
      </Button>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lock this space&apos;s schema?</DialogTitle>
            <DialogDescription>
              Locking the schema prevents structural changes — context types, schemas, and space mode cannot be modified. Content editing (creating and editing nodes) will still work.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleConfirmLock} disabled={lockSpace.isPending}>
              {lockSpace.isPending ? <Spinner size="sm" /> : 'Lock Schema'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
