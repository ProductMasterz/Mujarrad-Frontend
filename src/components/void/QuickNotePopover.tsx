'use client';

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateVoidNode } from '@/hooks/api/useVoidNodes';
import { useNotificationStore } from '@/stores/notificationStore';

type QuickNotePopoverProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

export function QuickNotePopover({ open, onOpenChange, children }: QuickNotePopoverProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const createVoidNode = useCreateVoidNode();
  const addNotification = useNotificationStore((s) => s.addNotification);

  const handleSubmit = () => {
    if (!title.trim()) return;
    createVoidNode.mutate(
      { title: title.trim(), content: content.trim() || undefined },
      {
        onSuccess: () => {
          addNotification({ type: 'success', source: 'node', title: 'Quick note created' });
          setTitle('');
          setContent('');
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex flex-col gap-3">
          <Label htmlFor="quick-note-title">Title</Label>
          <Input
            id="quick-note-title"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <Label htmlFor="quick-note-content">Content (optional)</Label>
          <Textarea
            id="quick-note-content"
            placeholder="Write something..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || createVoidNode.isPending}
            className="w-full"
          >
            {createVoidNode.isPending ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
