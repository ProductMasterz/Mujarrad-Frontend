'use client';

import React, { Suspense, useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, FolderKanban, Network, Bell, Settings, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { NotificationsDropdown } from '@/shell/components/NotificationsDropdown';
import { MoreMenuDropdown } from '@/shell/components/MoreMenuDropdown';
import { useNotificationStore } from '@/stores/notificationStore';
import { spaceService } from '@/services/api';
import { nodeService } from '@/services/api/node.service';
import { NodeType } from '@/types/backend-dtos';

interface NavbarProps {
  className?: string;
}

export function Navbar(props: NavbarProps) {
  return (
    <Suspense fallback={null}>
      <NavbarInner {...props} />
    </Suspense>
  );
}

function getNodeDetails(node: any): Record<string, unknown> {
  if (!node?.nodeDetails) return {};

  if (typeof node.nodeDetails === 'string') {
    try {
      return JSON.parse(node.nodeDetails);
    } catch {
      return {};
    }
  }

  return node.nodeDetails as Record<string, unknown>;
}

function NavbarInner({ className }: NavbarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const authPages = ['/login', '/register'];
  const isAuthPage = authPages.includes(pathname);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null);

  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const notificationsPanelRef = useRef<HTMLDivElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  const notifications = useNotificationStore((state) => state.notifications);
  const notificationSettings = useNotificationStore((state) => state.settings);
  const [mounted, setMounted] = useState(false);

  const pathParts = useMemo(() => pathname.split('/').filter(Boolean), [pathname]);

  const isSpacesRoute = pathParts[0] === 'spaces';
  const currentSpaceSlug = isSpacesRoute && pathParts[1] ? pathParts[1] : undefined;

  const currentContextSlug =
    isSpacesRoute && pathParts[2] === 'context' && pathParts[3]
      ? pathParts[3]
      : isSpacesRoute && pathParts[2] === 'graph'
        ? searchParams.get('context') || undefined
        : undefined;

  const currentNodeId =
    isSpacesRoute && pathParts[2] === 'node' && pathParts[3] ? pathParts[3] : undefined;

  const isGraphPage = isSpacesRoute && pathParts[2] === 'graph';

  const { data: currentSpace } = useQuery({
    queryKey: ['navbar', 'space', currentSpaceSlug],
    queryFn: () => spaceService.getSpaceBySlug(currentSpaceSlug as string),
    enabled: !!currentSpaceSlug,
  });

  const { data: currentNode } = useQuery({
    queryKey: ['navbar', 'space', currentSpaceSlug, 'node', currentNodeId],
    queryFn: () => nodeService.getNode(currentSpaceSlug as string, currentNodeId as string),
    enabled: !!currentSpaceSlug && !!currentNodeId,
  });

  const nodeDetails = useMemo(() => getNodeDetails(currentNode), [currentNode]);

  const nodeContextSlug =
    typeof nodeDetails.contextSlug === 'string' ? nodeDetails.contextSlug : undefined;

  const effectiveContextSlug = currentContextSlug || nodeContextSlug;

  const { data: currentContext } = useQuery({
    queryKey: ['navbar', 'space', currentSpaceSlug, 'context', effectiveContextSlug],
    queryFn: async () => {
      if (!currentSpaceSlug || !effectiveContextSlug) return null;

      const allNodes = await nodeService.getNodes(currentSpaceSlug, {
        page: 0,
        size: 1000,
      });

      return (
        allNodes.find(
          (node) =>
            node.nodeType === NodeType.CONTEXT &&
            node.slug === effectiveContextSlug
        ) || null
      );
    },
    enabled: !!currentSpaceSlug && !!effectiveContextSlug,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const unreadCount = notifications.filter((item) => !item.read).length;
  const showUnreadBadge =
    mounted &&
    notificationSettings.showUnreadBadge &&
    notificationSettings.enabled &&
    unreadCount > 0;

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        notificationsOpen &&
        notificationsPanelRef.current &&
        !notificationsPanelRef.current.contains(target) &&
        notificationButtonRef.current &&
        !notificationButtonRef.current.contains(target)
      ) {
        setNotificationsOpen(false);
      }

      if (
        moreMenuAnchor &&
        settingsMenuRef.current &&
        !settingsMenuRef.current.contains(target) &&
        settingsButtonRef.current &&
        !settingsButtonRef.current.contains(target)
      ) {
        setMoreMenuAnchor(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen, moreMenuAnchor]);

  useEffect(() => {
    setNotificationsOpen(false);
    setMoreMenuAnchor(null);
  }, [pathname]);

  if (isAuthPage) {
    return null;
  }

  return (
    <nav className={`fixed inset-x-0 top-0 z-50 border-b bg-background ${className || ''}`}>
      <div className="flex h-16 items-center gap-6 px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-semibold">
          <Network className="h-6 w-6" />
          <span>Mujarrad</span>
        </Link>

        <div className="flex min-w-0 flex-1 items-center gap-1">
          <Link href="/">
            <Button variant={isActive('/') ? 'secondary' : 'ghost'} size="sm" className="gap-2">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>

          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />

          <Link href="/spaces">
            <Button variant={isActive('/spaces') ? 'secondary' : 'ghost'} size="sm" className="gap-2">
              <FolderKanban className="h-4 w-4" />
              Spaces
            </Button>
          </Link>

          {currentSpaceSlug && (
            <>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />

              <Link href={`/spaces/${currentSpaceSlug}`} className="min-w-0">
                <Button
                  variant={!effectiveContextSlug && !currentNodeId && !isGraphPage ? 'secondary' : 'ghost'}
                  size="sm"
                  className="max-w-[220px] gap-2 truncate"
                  title={currentSpace?.name || currentSpaceSlug}
                >
                  <span className="truncate">{currentSpace?.name || currentSpaceSlug}</span>
                </Button>
              </Link>
            </>
          )}

          {effectiveContextSlug && (
            <>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />

              <Link href={`/spaces/${currentSpaceSlug}/context/${effectiveContextSlug}`} className="min-w-0">
                <Button
                  variant={!currentNodeId && !isGraphPage ? 'secondary' : 'ghost'}
                  size="sm"
                  className="max-w-[220px] truncate"
                  title={currentContext?.title || effectiveContextSlug}
                >
                  <span className="truncate">{currentContext?.title || effectiveContextSlug}</span>
                </Button>
              </Link>
            </>
          )}

          {isGraphPage && (
            <>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />

              <Link
                href={
                  effectiveContextSlug
                    ? `/spaces/${currentSpaceSlug}/graph?context=${effectiveContextSlug}`
                    : `/spaces/${currentSpaceSlug}/graph`
                }
                className="min-w-0"
              >
                <Button variant="secondary" size="sm" className="max-w-[180px] truncate">
                  Graph
                </Button>
              </Link>
            </>
          )}

          {currentNodeId && (
            <>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />

              <Link href={`/spaces/${currentSpaceSlug}/node/${currentNodeId}`} className="min-w-0">
                <Button
                  variant="secondary"
                  size="sm"
                  className="max-w-[260px] truncate"
                  title={currentNode?.title || 'Node'}
                >
                  <span className="truncate">{currentNode?.title || 'Node'}</span>
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="relative">
            <button
              ref={notificationButtonRef}
              onClick={() => {
                setMoreMenuAnchor(null);
                setNotificationsOpen((prev) => !prev);
              }}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Notifications"
              type="button"
            >
              <Bell className="h-5 w-5" />
              {showUnreadBadge && (
                <span className="absolute right-1 top-1 flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>

          <div className="relative">
            <button
              ref={settingsButtonRef}
              onClick={(event) => {
                setNotificationsOpen(false);
                setMoreMenuAnchor((prev) => (prev ? null : event.currentTarget));
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Settings"
              type="button"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>

          <ThemeToggle />
        </div>
      </div>

      {mounted && moreMenuAnchor && (
        <div ref={settingsMenuRef}>
          <MoreMenuDropdown
            onClose={() => setMoreMenuAnchor(null)}
            anchorEl={moreMenuAnchor}
          />
        </div>
      )}

      {mounted && notificationsOpen && notificationButtonRef.current && (
        <div ref={notificationsPanelRef}>
          <NotificationsDropdown
            anchorEl={notificationButtonRef.current}
            onClose={() => setNotificationsOpen(false)}
          />
        </div>
      )}
    </nav>
  );
}