'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createNodeSchema, type CreateNodeFormData } from '@/schemas';
import { useCreateNode } from '@/hooks/api';
import { NodeType } from '@/types/backend-dtos';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { isApiError } from '@/lib/errors';

interface CreateNodeDialogProps {
  workspaceSlug: string;
}

export function CreateNodeDialog({ workspaceSlug }: CreateNodeDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutate: createNode, isPending } = useCreateNode(workspaceSlug);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    reset,
  } = useForm<CreateNodeFormData>({
    resolver: zodResolver(createNodeSchema),
    defaultValues: {
      nodeType: NodeType.REGULAR,
    },
  });

  const onSubmit = (data: CreateNodeFormData) => {
    createNode(data, {
      onSuccess: () => {
        setOpen(false);
        reset();
      },
      onError: (error) => {
        if (isApiError(error)) {
          setError('root', { message: error.getUserMessage() });
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Node</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Node</DialogTitle>
          <DialogDescription>Add a new node to your knowledge graph</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Node title" {...register('title')} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nodeType">Type</Label>
              <Select
                defaultValue={NodeType.REGULAR}
                onValueChange={(value) => setValue('nodeType', value as NodeType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NodeType.REGULAR}>Regular</SelectItem>
                  <SelectItem value={NodeType.CONTEXT}>Context</SelectItem>
                  <SelectItem value={NodeType.ASSUMPTION}>Assumption</SelectItem>
                </SelectContent>
              </Select>
              {errors.nodeType && <p className="text-sm text-destructive">{errors.nodeType.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="markdownContent">Content (Markdown)</Label>
              <Textarea
                id="markdownContent"
                placeholder="# Content here..."
                rows={6}
                {...register('markdownContent')}
              />
              {errors.markdownContent && (
                <p className="text-sm text-destructive">{errors.markdownContent.message}</p>
              )}
            </div>

            {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
