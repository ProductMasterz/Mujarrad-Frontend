'use client';

import { useState } from 'react';
import { Inbox, ArrowRight, CheckSquare, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBlankNodes } from '@/hooks/api/useBlankNodes';
import { AssignToContextDialog } from './AssignToContextDialog';
import type { Node } from '@/types/backend-dtos';

interface BlankNodesPanelProps {
  spaceSlug: string;
}

export function BlankNodesPanel({ spaceSlug }: BlankNodesPanelProps) {
  const { data: blankNodes = [], isLoading } = useBlankNodes(spaceSlug);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignNodeIds, setAssignNodeIds] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);

  const nodes = Array.isArray(blankNodes) ? blankNodes : [];

  const allSelected = nodes.length > 0 && selectedIds.size === nodes.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(nodes.map((n: Node) => n.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openAssignDialog = (ids: string[]) => {
    setAssignNodeIds(ids);
    setAssignDialogOpen(true);
  };

  const handleAssigned = () => {
    setSelectedIds(new Set());
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
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-900">
        <CheckSquare className="mx-auto h-10 w-10 text-gray-400" />
        <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-300">
          All nodes are organized
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          No unorganized nodes in this space.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
        {/* Header — clickable to expand/collapse */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-t-xl"
        >
          <div className="flex items-center gap-2">
            {expanded ? <ChevronDown className="h-3.5 w-3.5 text-gray-500" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-500" />}
            <Inbox className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              The Blank — Unorganized
            </h3>
            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {nodes.length}
            </span>
          </div>

        </button>

        {/* Expanded content */}
        {expanded && (<>
          <div className="flex items-center justify-end gap-2 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
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

          {/* Node list */}
        <ScrollArea className="max-h-[400px]">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {nodes.map((node: Node) => (
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
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {node.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {node.nodeType}
                    </span>
                    {node.createdAt && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(node.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openAssignDialog([node.id])}
                  className="text-xs gap-1"
                >
                  Assign
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
        </>)}
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
