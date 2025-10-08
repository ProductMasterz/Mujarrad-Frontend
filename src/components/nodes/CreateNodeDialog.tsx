'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createNodeSchema, type CreateNodeFormData } from '@/schemas';
import { useCreateNode, useWorkspaceNodes, useCreateAttribute } from '@/hooks/api';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MarkdownPreview } from './MarkdownPreview';
import { isApiError } from '@/lib/errors';

interface CreateNodeDialogProps {
  workspaceSlug: string;
}

export function CreateNodeDialog({ workspaceSlug }: CreateNodeDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  const { mutate: createNode, isPending } = useCreateNode();
  const { mutate: createAttribute } = useCreateAttribute();

  // Fetch all workspace nodes for parent selection
  const { data: nodes = [] } = useWorkspaceNodes(workspaceSlug, { type: NodeType.CONTEXT });

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
    createNode(data, {
      onSuccess: (newNode) => {
        // If a parent was selected, create the CONTAINS relationship
        if (selectedParentId) {
          createAttribute({
            sourceNodeId: selectedParentId,
            data: {
              targetNodeId: newNode.id,
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Node</DialogTitle>
          <DialogDescription>Add a new node to your knowledge graph</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <div className="space-y-4 pb-4">
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
                  <SelectContent>
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
              <Select value={selectedParentId || ''} onValueChange={(value) => setSelectedParentId(value || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="No parent (root level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No parent (root level)</SelectItem>
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

          {/* Split view: Editor | Preview */}
          <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="content">Content (Markdown)</Label>
              <Textarea
                id="content"
                placeholder="# Content here...&#10;&#10;Write your markdown content. The preview will update as you type."
                className="flex-1 resize-none font-mono text-sm"
                {...register('content')}
              />
              {errors.content && (
                <p className="text-sm text-destructive">{errors.content.message}</p>
              )}
            </div>

            <div className="space-y-2 flex flex-col">
              <Label>Preview</Label>
              <div className="flex-1 overflow-y-auto border rounded-md p-4 bg-muted/30">
                <MarkdownPreview content={content || ''} />
              </div>
            </div>
          </div>

          {errors.root && <p className="text-sm text-destructive pt-2">{errors.root.message}</p>}

          <DialogFooter className="pt-4">
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
