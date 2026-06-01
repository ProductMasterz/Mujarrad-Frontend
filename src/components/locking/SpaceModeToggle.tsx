'use client';

import { useState } from 'react';
import { Settings, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { spaceService } from '@/services/api';
import { spaceKeys } from '@/hooks/api/useSpaces';

interface SpaceModeToggleProps {
  spaceId: string;
  currentMode: string | null;
  projectType: string;
  isLocked: boolean;
}

export function SpaceModeToggle({ spaceId, currentMode, projectType, isLocked }: SpaceModeToggleProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const queryClient = useQueryClient();

  const isBackend = projectType === 'BACKEND';
  const isProduction = currentMode === 'PRODUCTION';

  const updateMode = useMutation({
    mutationFn: (mode: string) => spaceService.updateSpace(spaceId, { mode: mode as 'CONFIGURATION' | 'PRODUCTION' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spaceKeys.all });
    },
  });

  if (!isBackend) return null;

  const handleToggle = () => {
    if (isProduction) {
      updateMode.mutate('CONFIGURATION');
    } else {
      setShowConfirm(true);
    }
  };

  const handleConfirmProduction = () => {
    updateMode.mutate('PRODUCTION');
    setShowConfirm(false);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={isProduction
            ? 'border-green-400 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/40 dark:text-green-300'
            : 'border-yellow-400 bg-yellow-50 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300'
          }
        >
          {isProduction ? (
            <><Rocket className="h-3 w-3 mr-1" />Production</>
          ) : (
            <><Settings className="h-3 w-3 mr-1" />Configuration</>
          )}
        </Badge>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          disabled={isLocked || updateMode.isPending}
          className="text-xs"
        >
          {updateMode.isPending ? (
            <Spinner size="sm" />
          ) : isProduction ? (
            'Switch to Configuration'
          ) : (
            'Switch to Production'
          )}
        </Button>
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Switch to Production?</DialogTitle>
            <DialogDescription>
              Switching to Production will enforce schemas. Context type schemas will be validated when creating nodes. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleConfirmProduction}>
              Switch to Production
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
