'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Inbox, ArrowRight, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBlankNodes, blankKeys } from '@/hooks/api/useBlankNodes';
import { AssignToContextDialog } from './AssignToContextDialog';
import { CardType } from '@/shell/data/projects';
import { NodeType, type Node } from '@/types/backend-dtos';
import { ProjectCard } from '@/shell/components/ProjectCard';
import { useQueryClient } from '@tanstack/react-query';

interface BlankNodesPanelProps {
  spaceSlug: string;
}

function getNodeDetails(node: Node): Record<string, unknown> {
  if (typeof node.nodeDetails === 'string') {
    try {
      return JSON.parse(node.nodeDetails);
    } catch {
      return {};
    }
  }

  return (node.nodeDetails as Record<string, unknown> | undefined) ?? {};
}

function isDisplayableBlankNode(node: Node): boolean {
  const details = getNodeDetails(node);
  const title = String(node.title || '').toLowerCase();
  const slugValue = String(node.slug || '').toLowerCase();

  if (node.isBuiltin) return false;
  if (node.nodeType === NodeType.CONTEXT) return false;

  if (details.showInSpaceList === false) return false;
  if (details.blockType) return false;

  if (details.contextSlug) return false;
  if (details.parentContextSlug) return false;
  if (details.contextId) return false;

  if (details.systemContext === 'chat') return false;
  if (details.chatNodeType) return false;
  if (details.createdFrom === 'chat') return false;
  if (details.createdFrom === 'assistant-ui') return false;

  if (details.role === 'conversation') return false;
  if (details.role === 'user') return false;
  if (details.role === 'assistant') return false;

  if (title === 'mujarrad chat') return false;
  if (slugValue === 'mujarrad-chat') return false;
  if (title.includes('conversation')) return false;
  if (title.includes('assistant message')) return false;
  if (title.includes('user message')) return false;

  return true;
}

function getBlankNodeDescription(node: Node): string {
  const contentPreview = (node.content || '').trim();

  if (contentPreview) {
    return contentPreview.length > 110
      ? `${contentPreview.slice(0, 110)}...`
      : contentPreview;
  }

  if (node.updatedAt) {
    return `Updated ${new Date(node.updatedAt).toLocaleDateString()}`;
  }

  if (node.createdAt) {
    return `Created ${new Date(node.createdAt).toLocaleDateString()}`;
  }

  return 'Unorganized node. Assign it to a context when ready.';
}

function getBlankNodeKindLabel(node: Node): string {
  if (node.nodeType === NodeType.ATTRIBUTE) return 'ATTRIBUTE';
  return 'NODE';
}

export function BlankNodesPanel({ spaceSlug }: BlankNodesPanelProps) {
  const router = useRouter();
  const { data: blankNodes = [], isLoading } = useBlankNodes(spaceSlug);
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignNodeIds, setAssignNodeIds] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const nodes = Array.isArray(blankNodes)
    ? blankNodes.filter(isDisplayableBlankNode)
    : [];

  const allSelected = nodes.length > 0 && selectedIds.size === nodes.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }

    setSelectedIds(new Set(nodes.map((node) => node.id)));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const openAssignDialog = (ids: string[]) => {
    setAssignNodeIds(ids);
    setAssignDialogOpen(true);
  };

  const handleAssigned = () => {
    setSelectedIds(new Set());

    queryClient.invalidateQueries({
      queryKey: blankKeys.nodes(spaceSlug),
    });

    queryClient.invalidateQueries({
      queryKey: blankKeys.count(spaceSlug),
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
        <p className="text-sm text-muted-foreground">Loading blank nodes...</p>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-900">
        <p className="text-sm text-muted-foreground">
          No unassigned nodes.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between rounded-t-xl px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800">
          <button
            onClick={() => setExpanded((value) => !value)}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
            type="button"
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-gray-500" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-500" />
            )}

            <Inbox className="h-4 w-4 shrink-0 text-gray-500" />

            <h3 className="truncate text-sm font-semibold text-gray-700 dark:text-gray-200">
              The Blank — Unorganized
            </h3>

            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {nodes.length}
            </span>
          </button>

          <div className="ml-3 flex items-center gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setViewMode('list');
              }}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                viewMode === 'list'
                  ? 'bg-foreground text-background'
                  : 'border border-border bg-background text-foreground hover:bg-muted'
              }`}
            >
              List
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setViewMode('grid');
              }}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                viewMode === 'grid'
                  ? 'bg-foreground text-background'
                  : 'border border-border bg-background text-foreground hover:bg-muted'
              }`}
            >
              Grid
            </button>
          </div>
        </div>

        {expanded && (
          <>
            <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-4 py-2 dark:border-gray-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSelectAll}
                className="text-xs"
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </Button>

              {selectedIds.size > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openAssignDialog(Array.from(selectedIds))}
                  className="text-xs"
                >
                  Bulk Assign ({selectedIds.size})
                </Button>
              )}
            </div>

            <ScrollArea className="h-[420px] border-t border-gray-200 dark:border-gray-700">
              {viewMode === 'list' ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {nodes.map((node) => (
                    <div
                      key={node.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(node.id)}
                        onChange={() => toggleSelect(node.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />

                      <button
                        type="button"
                        onClick={() => router.push(`/spaces/${spaceSlug}/node/${node.id}`)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="truncate text-sm font-medium text-foreground">
                          {node.title}
                        </p>

                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {node.nodeType}
                          </span>

                          {node.createdAt && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(node.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openAssignDialog([node.id])}
                        className="gap-1 text-xs"
                      >
                        Assign
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 p-4">
                  {nodes.map((node) => (
                    <div key={node.id} className="relative">
                      <ProjectCard
                        title={node.title}
                        color="#9ca3af"
                        type={CardType.NODE}
                        eyebrowLabelOverride={getBlankNodeKindLabel(node)}
                        descriptionTextOverride={getBlankNodeDescription(node)}
                        onClick={() => router.push(`/spaces/${spaceSlug}/node/${node.id}`)}
                        onContextMenu={(event) => event.preventDefault()}
                      />

                  

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openAssignDialog([node.id]);
                        }}
                        className="absolute bottom-3 right-3 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground shadow-sm transition hover:bg-muted"
                      >
                        Assign
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </>
        )}
      </div>

      <AssignToContextDialog
        spaceSlug={spaceSlug}
        nodeIds={assignNodeIds}
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        onAssigned={handleAssigned}
      />
    </>
  );
}