'use client';

import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useUnlockSpace } from '@/hooks/api/useLocking';

interface LockedBannerProps {
  spaceSlug: string;
  onUnlock?: () => void;
}

export function LockedBanner({ spaceSlug, onUnlock }: LockedBannerProps) {
  const unlockSpace = useUnlockSpace();

  const handleUnlock = () => {
    unlockSpace.mutate({ spaceSlug }, { onSuccess: onUnlock });
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/40">
      <div className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-200">
        <Lock className="h-4 w-4" />
        This space is locked. All editing is disabled.
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleUnlock}
        disabled={unlockSpace.isPending}
        className="rounded-xl"
      >
        {unlockSpace.isPending ? <Spinner size="sm" /> : 'Unlock'}
      </Button>
    </div>
  );
}
