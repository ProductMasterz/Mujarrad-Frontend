'use client';

import { Lock, Unlock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { useLockNode, useUnlockNode } from '@/hooks/api/useLocking';
import { LockLevel } from '@/types/backend-dtos';

type LockLevelString = 'UNLOCKED' | 'CONTENT_LOCKED' | 'FULLY_LOCKED';

interface LockToggleProps {
  spaceSlug: string;
  nodeId: string;
  currentLockLevel: LockLevelString;
  onLockChanged?: () => void;
}

export function LockToggle({ spaceSlug, nodeId, currentLockLevel, onLockChanged }: LockToggleProps) {
  const lockNode = useLockNode();
  const unlockNode = useUnlockNode();

  const isPending = lockNode.isPending || unlockNode.isPending;

  const handleSelect = (level: string) => {
    if (level === currentLockLevel) return;

    if (level === 'UNLOCKED') {
      unlockNode.mutate({ spaceSlug, nodeId }, { onSuccess: onLockChanged });
    } else {
      lockNode.mutate({ spaceSlug, nodeId, lockLevel: level as LockLevel }, { onSuccess: onLockChanged });
    }
  };

  const icon = isPending ? (
    <Spinner size="sm" />
  ) : currentLockLevel === 'FULLY_LOCKED' ? (
    <Lock className="h-4 w-4 text-red-500" />
  ) : currentLockLevel === 'CONTENT_LOCKED' ? (
    <Lock className="h-4 w-4 text-amber-500" />
  ) : (
    <Unlock className="h-4 w-4 text-muted-foreground" />
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl" disabled={isPending}>
          {icon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleSelect('UNLOCKED')}>
          <Unlock className="mr-2 h-4 w-4" />
          Unlock
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelect('CONTENT_LOCKED')}>
          <Lock className="mr-2 h-4 w-4 text-amber-500" />
          Content Lock
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelect('FULLY_LOCKED')}>
          <Shield className="mr-2 h-4 w-4 text-red-500" />
          Full Lock
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
