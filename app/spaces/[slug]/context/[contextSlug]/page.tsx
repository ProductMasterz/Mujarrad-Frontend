'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useContextNodes, useChildContexts, useCreateNodeInContext } from '@/hooks/api/useContextNodes';
import { useSpace } from '@/hooks/api';
import { NodeType } from '@/types/backend-dtos';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ChevronRight,
  Home,
  FolderOpen,
  FileText,
  Plus,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { ContextCard } from '@/components/contexts/ContextCard';
import type { Node } from '@/types/backend-dtos';

export default function ContextDetailPage() {
  const params = useParams();
  const router = useRouter();
  const spaceSlug = params.slug as string;
  const contextSlug = params.contextSlug as string;

  const { data: space } = useSpace(spaceSlug);
  const { data: nodes = [], isLoading } = useContextNodes(spaceSlug, contextSlug);
  const { data: childContexts = [] } = useChildContexts(spaceSlug, contextSlug);
  const createNode = useCreateNodeInContext();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newNodeTitle, setNewNodeTitle] = useState('');

  const regularNodes = nodes.filter((n: Node) => n.nodeType !== NodeType.CONTEXT && !n.isBuiltin);
  const contextName = contextSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const handleCreateNode = () => {
    if (!newNodeTitle.trim()) return;
    createNode.mutate(
      {
        spaceSlug,
        contextSlug,
        data: {
          title: newNodeTitle.trim(),
          nodeType: NodeType.REGULAR,
          content: '',
          nodeDetails: { editorMode: 'blocks', isPage: true },
        },
      },
      {
        onSuccess: (node) => {
          setShowCreateDialog(false);
          setNewNodeTitle('');
          router.push(`/spaces/${spaceSlug}/node/${node.id}`);
        },
      }
    );
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card/50 px-6 py-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <button onClick={() => router.push('/')} className="hover:text-foreground transition-colors">
              <Home className="h-3.5 w-3.5" />
            </button>
            <ChevronRight className="h-3 w-3" />
            <button onClick={() => router.push('/spaces')} className="hover:text-foreground transition-colors">
              Spaces
            </button>
            <ChevronRight className="h-3 w-3" />
            <button onClick={() => router.push(`/spaces/${spaceSlug}`)} className="hover:text-foreground transition-colors">
              {space?.name || spaceSlug}
            </button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{contextName}</span>
          </nav>

          {/* Title row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/spaces/${spaceSlug}`)}
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/40">
                <FolderOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">{contextName}</h1>
                <p className="text-xs text-muted-foreground">
                  {regularNodes.length} {regularNodes.length === 1 ? 'node' : 'nodes'}
                  {childContexts.length > 0 && ` · ${childContexts.length} sub-contexts`}
                </p>
              </div>
            </div>

            <Button onClick={() => setShowCreateDialog(true)} size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Create Node
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 max-w-6xl">
          {/* Child contexts */}
          {childContexts.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-3">
                Sub-Contexts ({childContexts.length})
              </h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
                {childContexts.map((ctx: Node) => (
                  <ContextCard
                    key={ctx.id}
                    spaceSlug={spaceSlug}
                    contextId={ctx.id}
                    contextSlug={ctx.slug}
                    title={ctx.title}
                    isBuiltin={ctx.isBuiltin}
                    lockLevel={ctx.lockLevel}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Nodes */}
          <div className="mb-3">
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Nodes ({regularNodes.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : regularNodes.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No nodes in this context</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 gap-1.5"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Create first node
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
              {regularNodes.map((node: Node) => (
                <Card
                  key={node.id}
                  className="cursor-pointer hover:shadow-md transition-all group"
                  onClick={() => router.push(`/spaces/${spaceSlug}/node/${node.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">
                        {node.title}
                      </h3>
                      {node.lockLevel !== 'UNLOCKED' && (
                        <Lock className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 ml-2" />
                      )}
                    </div>
                    {node.content && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {node.content.slice(0, 100)}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {node.nodeType}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(node.updatedAt || node.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Create Node Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Create Node in {contextName}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Node title"
                value={newNodeTitle}
                onChange={(e) => setNewNodeTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateNode()}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateNode}
                disabled={!newNodeTitle.trim() || createNode.isPending}
              >
                {createNode.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
