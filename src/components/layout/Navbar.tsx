'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FolderKanban, Network, Bell, Settings, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { NotificationsDropdown } from '@/shell/components/NotificationsDropdown';
import { MoreMenuDropdown } from '@/shell/components/MoreMenuDropdown';
import { useNotificationStore } from '@/stores/notificationStore';
import { spaceService } from '@/services/api';
import { nodeService } from '@/services/api/node.service';

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const pathname = usePathname();

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
  const currentNodeId =
    isSpacesRoute && pathParts[2] === 'node' && pathParts[3] ? pathParts[3] : undefined;

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
            <Button
              variant={isActive('/') ? 'secondary' : 'ghost'}
              size="sm"
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>

          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />

          <Link href="/spaces">
            <Button
              variant={isActive('/spaces') ? 'secondary' : 'ghost'}
              size="sm"
              className="gap-2"
            >
              <FolderKanban className="h-4 w-4" />
              Spaces
            </Button>
          </Link>

          {currentSpaceSlug && (
            <>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />

              <Link
                href={`/spaces/${currentSpaceSlug}`}
                className="min-w-0"
              >
                <Button
                  variant={!currentNodeId ? 'secondary' : 'ghost'}
                  size="sm"
                  className="max-w-[220px] gap-2 truncate"
                  title={currentSpace?.name || currentSpaceSlug}
                >
                  <span className="truncate">
                    {currentSpace?.name || currentSpaceSlug}
                  </span>
                </Button>
              </Link>
            </>
          )}

          {currentNodeId && (
            <>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />

              <Link
                href={`/spaces/${currentSpaceSlug}/node/${currentNodeId}`}
                className="min-w-0"
              >
                <Button
                  variant="secondary"
                  size="sm"
                  className="max-w-[260px] truncate"
                  title={currentNode?.title || 'Node'}
                >
                  <span className="truncate">
                    {currentNode?.title || 'Node'}
                  </span>
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