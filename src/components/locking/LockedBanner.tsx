'use client';

import { Shield } from 'lucide-react';
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
    <div className="flex items-center justify-between gap-3 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 dark:border-purple-800 dark:bg-purple-950/40">
      <div className="flex items-center gap-2 text-sm font-medium text-purple-800 dark:text-purple-200">
        <Shield className="h-4 w-4" />
        Schema locked — structure changes disabled. Content editing still works.
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleUnlock}
        disabled={unlockSpace.isPending}
        className="rounded-xl"
      >
        {unlockSpace.isPending ? <Spinner size="sm" /> : 'Unlock Schema'}
      </Button>
    </div>
  );
}
