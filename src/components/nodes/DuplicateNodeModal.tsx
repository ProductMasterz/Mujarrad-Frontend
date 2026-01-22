'use client';

import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, GitMerge, FilePlus, Edit3 } from 'lucide-react';
import type { Node } from '@/types/backend-dtos';
import type { DuplicateAction } from '@/hooks/api/useDuplicateCheck';

interface DuplicateNodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingNode: Node;
  newTitle: string;
  suggestedTitle: string;
  onAction: (action: DuplicateAction, renamedTitle?: string) => void;
}

export function DuplicateNodeModal({
  open,
  onOpenChange,
  existingNode,
  newTitle,
  suggestedTitle,
  onAction,
}: DuplicateNodeModalProps) {
  const [mode, setMode] = useState<'choose' | 'rename'>('choose');
  const [renamedTitle, setRenamedTitle] = useState(suggestedTitle);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setMode('choose');
      setRenamedTitle(suggestedTitle);
    }
  }, [open, suggestedTitle]);

  const handleMerge = () => {
    onAction('merge');
    onOpenChange(false);
  };

  const handleCreateAnyway = () => {
    onAction('create-anyway');
    onOpenChange(false);
  };

  const handleRename = () => {
    if (mode === 'choose') {
      setMode('rename');
    } else {
      onAction('rename', renamedTitle);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    onAction('cancel');
    onOpenChange(false);
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Node Already Exists
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                A node with the name <strong>&quot;{newTitle}&quot;</strong> already exists in
                this space.
              </p>

              {/* Existing node preview */}
              <div className="border rounded-lg p-3 bg-muted/50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {existingNode.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created {formatDate(existingNode.createdAt)}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {existingNode.nodeType.toLowerCase()}
                  </Badge>
                </div>
                {existingNode.content && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {existingNode.content.slice(0, 100)}
                    {existingNode.content.length > 100 ? '...' : ''}
                  </p>
                )}
              </div>

              {mode === 'rename' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    New name:
                  </label>
                  <Input
                    value={renamedTitle}
                    onChange={(e) => setRenamedTitle(e.target.value)}
                    placeholder="Enter a new name"
                    autoFocus
                  />
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {mode === 'choose' ? (
          <div className="space-y-2 mt-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleMerge}
            >
              <GitMerge className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Merge</div>
                <div className="text-xs text-muted-foreground">
                  Navigate to existing node and append your content
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleCreateAnyway}
            >
              <FilePlus className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Create Anyway</div>
                <div className="text-xs text-muted-foreground">
                  Create a new node with the same name
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleRename}
            >
              <Edit3 className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Rename</div>
                <div className="text-xs text-muted-foreground">
                  Choose a different name for your new node
                </div>
              </div>
            </Button>
          </div>
        ) : (
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel onClick={() => setMode('choose')}>Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRename}
              disabled={!renamedTitle.trim() || renamedTitle === newTitle}
            >
              Create with New Name
            </AlertDialogAction>
          </AlertDialogFooter>
        )}

        {mode === 'choose' && (
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
