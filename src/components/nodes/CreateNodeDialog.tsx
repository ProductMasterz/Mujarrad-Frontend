'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createNodeSchema, type CreateNodeFormData } from '@/schemas';
import { useCreateNode, useSpaceNodes, useCreateAttribute } from '@/hooks/api';
import { NodeType, AttributeKey } from '@/types/backend-dtos';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { MarkdownEditor } from '@/components/markdown/MarkdownEditor'; // Temporarily disabled
import { isApiError } from '@/lib/errors';

interface CreateNodeDialogProps {
  spaceSlug: string;
}

export function CreateNodeDialog({ spaceSlug }: CreateNodeDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  const { mutate: createNode, isPending } = useCreateNode();
  const { mutate: createAttribute } = useCreateAttribute();

  // Fetch all space nodes for parent selection
  const { data: nodes = [] } = useSpaceNodes(spaceSlug, { type: NodeType.CONTEXT });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    reset,
    control,
  } = useForm<CreateNodeFormData>({
    resolver: zodResolver(createNodeSchema),
    defaultValues: {
      nodeType: NodeType.REGULAR,
      content: '',
    },
  });

  // Watch markdown content for live preview
  const content = useWatch({
    control,
    name: 'content',
    defaultValue: '',
  });

  const onSubmit = (data: CreateNodeFormData) => {
    createNode({ spaceSlug: spaceSlug, data }, {
      onSuccess: (newNode) => {
        // If a parent was selected, create the CONTAINS relationship
        if (selectedParentId) {
          createAttribute({
            sourceNodeId: selectedParentId,
            data: {
              targetNodeId: Number(newNode.id),
              attributeKey: AttributeKey.CONTAINS,
            },
          }, {
            onSuccess: () => {
              setOpen(false);
              reset();
              setSelectedParentId(null);
            },
            onError: (error) => {
              if (isApiError(error)) {
                // T075: Handle circular dependency errors
                if (error.statusCode === 400 && error.message.toLowerCase().includes('circular')) {
                  setError('root', {
                    message: `Cannot create this relationship: it would create a circular dependency. ${error.detail || ''}`
                  });
                } else {
                  setError('root', { message: `Node created but failed to add to parent: ${error.getUserMessage()}` });
                }
              }
            },
          });
        } else {
          setOpen(false);
          reset();
          setSelectedParentId(null);
        }
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
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>Create Node</DialogTitle>
          <DialogDescription>Add a new node to your knowledge graph</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 space-y-4 shrink-0">
            <div className="grid grid-cols-2 gap-4">
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
                  <SelectContent position="popper" className="z-[100]">
                    <SelectItem value={NodeType.REGULAR}>Regular</SelectItem>
                    <SelectItem value={NodeType.CONTEXT}>Context</SelectItem>
                    <SelectItem value={NodeType.ASSUMPTION}>Assumption</SelectItem>
                  </SelectContent>
                </Select>
                {errors.nodeType && <p className="text-sm text-destructive">{errors.nodeType.message}</p>}
              </div>
            </div>

            {/* Parent node selection */}
            <div className="space-y-2">
              <Label htmlFor="parentNode">Parent Node (Optional)</Label>
              <Select value={selectedParentId || 'none'} onValueChange={(value) => setSelectedParentId(value === 'none' ? null : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="No parent (root level)" />
                </SelectTrigger>
                <SelectContent position="popper" className="z-[100] max-h-[200px] overflow-y-auto">
                  <SelectItem value="none">No parent (root level)</SelectItem>
                  {nodes.map((node) => (
                    <SelectItem key={node.id} value={node.id.toString()}>
                      📁 {node.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select a CONTEXT node to nest this node under it in the hierarchy
              </p>
            </div>
          </div>

          {/* Simple textarea - MarkdownEditor temporarily disabled */}
          <div className="flex-1 min-h-0 flex flex-col px-6 py-4">
            <Label htmlFor="content" className="mb-2">Content (Markdown)</Label>
            <textarea
              id="content"
              value={content || ''}
              onChange={(e) => setValue('content', e.target.value)}
              placeholder="# Write your content here...

Supports **bold**, *italic*, code blocks, tables, and more!"
              maxLength={50000}
              className="flex-1 min-h-0 w-full p-3 border border-gray-200 rounded-lg resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.content && (
              <p className="text-sm text-destructive mt-2">{errors.content.message}</p>
            )}
          </div>

          {errors.root && <p className="text-sm text-destructive px-6">{errors.root.message}</p>}

          <DialogFooter className="px-6 py-4 border-t shrink-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Node'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
