'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Inbox,
  Trash2,
  ArrowRightCircle,
  Pencil,
} from 'lucide-react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/shell/components/Header';
import { Sidebar } from '@/shell/components/Sidebar';
import { Tab } from '@/shell/components/TabsBar';
import { CardType, Card as ShellCard } from '@/shell/data/projects';
import { NodeCard } from '@/shell/components/NodeCard';
import { Button } from '@/components/ui/button';
import { useVoidNodes, useDeleteVoidNode } from '@/hooks/api/useVoidNodes';
import { useNotificationStore } from '@/stores/notificationStore';
import { AssignVoidDialog } from '@/components/void/AssignVoidDialog';
import type { Node } from '@/types/backend-dtos';

function voidNodeToSidebarCard(node: Node): ShellCard {
  return {
    id: node.id,
    title: node.title,
    color: '#525252',
    type: CardType.NODE,
  };
}

export default function VoidPage() {
  const router = useRouter();
  const { data: nodes = [], isLoading } = useVoidNodes();
  const deleteMutation = useDeleteVoidNode();
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [assignNodeId, setAssignNodeId] = useState<string | null>(null);
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'tab-1',
      title: 'The Void',
      navigationPath: [],
      spaceId: 'void',
    },
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');

  const safeNodes = Array.isArray(nodes) ? nodes : [];

  const sidebarData = useMemo(
    () => safeNodes.map((node: Node) => voidNodeToSidebarCard(node)),
    [safeNodes]
  );

  const breadcrumbPath = useMemo(
    () => [
      { id: 'home', title: 'Home' },
      { id: 'spaces', title: 'Spaces' },
      { id: 'void', title: 'The Void' },
    ],
    []
  );

  const handleDelete = (nodeId: string) => {
    deleteMutation.mutate(nodeId, {
      onSuccess: () => {
        addNotification({
          type: 'success',
          source: 'node',
          title: 'Void node deleted',
          description: 'The node was removed from The Void.',
        });
      },
      onError: () => {
        addNotification({
          type: 'error',
          source: 'node',
          title: 'Delete failed',
          description: 'Could not delete this Void node.',
        });
      },
    });
  };

  const handleHomeClick = () => {
    router.push('/');
  };

  const handleBackClick = () => {
    router.push('/spaces');
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1 || index === 0) {
      router.push('/');
      return;
    }

    if (index === 1) {
      router.push('/spaces');
      return;
    }

    if (index === 2) {
      router.push('/void');
    }
  };

  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
  };

  const handleTabClose = (tabId: string) => {
    if (tabs.length === 1) return;

    const nextTabs = tabs.filter((tab) => tab.id !== tabId);
    setTabs(nextTabs);

    if (activeTabId === tabId) {
      setActiveTabId(nextTabs[0].id);
    }
  };

  const handleNewTab = () => {
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      title: 'The Void',
      navigationPath: [],
      spaceId: 'void',
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleSidebarNavigate = (path: string[]) => {
    const nodeId = path[path.length - 1];
    if (!nodeId) return;

    // For now Void nodes do not have a full editor route unless your backend has one.
    // Keep this as assign/open logic later.
  };

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen bg-background text-foreground">
        <Header
          onMenuClick={() => {}}
          onBackClick={handleBackClick}
          showBackButton={true}
          breadcrumbPath={breadcrumbPath}
          onHomeClick={handleHomeClick}
          onBreadcrumbClick={handleBreadcrumbClick}
          tabs={tabs}
          activeTabId={activeTabId}
          onTabClick={handleTabClick}
          onTabClose={handleTabClose}
          onNewTab={handleNewTab}
        />

        <Sidebar
          isOpen={false}
          selectedItem={null}
          onNavigate={handleSidebarNavigate}
          items={sidebarData}
        />

        <div className="px-5 pt-[126px] pb-8">
          <div className="mb-4 rounded-[22px] border border-border bg-background px-5 py-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-900">
                    <Inbox className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
                  </div>

                  <div>
                    <h1 className="text-[28px] font-semibold leading-tight text-foreground">
                      The Void
                    </h1>
                    <p className="mt-1 max-w-[680px] text-sm leading-5 text-muted-foreground">
                      Quick notes created outside any space. Assign them to a space and context when ready.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="min-w-[120px] rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Void Nodes
                  </div>
                  <div className="mt-1 text-xl font-semibold leading-none text-foreground">
                    {safeNodes.length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-[400px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : safeNodes.length === 0 ? (
            <div className="flex h-[400px] flex-col items-center justify-center rounded-[22px] border border-dashed border-border bg-background p-8 text-center">
              <Inbox className="mb-3 h-12 w-12 text-muted-foreground/50" />
              <p className="text-base font-medium text-foreground">
                No Void nodes yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Nodes created without a selected space will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
              {safeNodes.map((node: Node) => {
                const preview = (node.content || '').trim().slice(0, 120) || undefined;
                const meta = node.createdAt
                  ? `Created ${new Date(node.createdAt).toLocaleDateString()}`
                  : 'Void node';

                return (
                  <div key={node.id} className="relative">
                    <NodeCard
                      title={node.title}
                      preview={preview}
                      meta={meta}
                      type={CardType.NODE}
                      nodeKindLabel="Void"
                      onClick={() => setAssignNodeId(node.id)}
                      onContextMenu={(event) => event.preventDefault()}
                    />

                    <div className="absolute bottom-3 right-3 flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        title="Edit later"
                        type="button"
                      >
                        <Pencil className="size-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => setAssignNodeId(node.id)}
                        title="Assign to space"
                        type="button"
                      >
                        <ArrowRightCircle className="size-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(node.id)}
                        title="Delete"
                        type="button"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {assignNodeId && (
          <AssignVoidDialog
            nodeId={assignNodeId}
            open={!!assignNodeId}
            onOpenChange={(open) => {
              if (!open) setAssignNodeId(null);
            }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}