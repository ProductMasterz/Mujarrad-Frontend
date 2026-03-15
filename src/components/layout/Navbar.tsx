'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { Search, Home, MessageSquare, Network, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CommandPalette } from '@/components/search/CommandPalette';

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const pathname = usePathname();
  const params = useParams();
  const [searchOpen, setSearchOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const hideNavbarChatButton =  pathname.includes('/graph') || pathname.includes('/whiteboard');

  const currentSpaceSlug = params?.slug as string | undefined;

  const authPages = ['/login', '/register'];
  const isAuthPage = authPages.includes(pathname);
  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  useEffect(() => {
    if (isAuthPage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isAuthPage]);

  if (isAuthPage) {
    return null;
  }

  return (
    <>
      <CommandPalette
        open={searchOpen}
        onOpenChange={setSearchOpen}
        currentSpaceSlug={currentSpaceSlug}
      />

      <nav className={`border-b bg-background ${className || ''}`}>
        <div className="flex h-16 items-center px-6 gap-6">
          <Link href="/spaces" className="flex items-center gap-2 font-semibold text-lg">
            <Network className="h-6 w-6" />
            <span>Mujarrad</span>
          </Link>

          <div className="flex items-center gap-1 flex-1">
            <Link href="/spaces">
              <Button
                variant={isActive('/spaces') ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Spaces
              </Button>
            </Link>

            {!hideNavbarChatButton && (
            <Button
              variant={chatOpen ? 'secondary' : 'ghost'}
              size="sm"
              className="gap-2"
              onClick={() => setChatOpen(true)}
            >
              <MessageSquare className="h-4 w-4" />
              Chat
            </Button>
          )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
              <span className="hidden md:inline">Search</span>
              <kbd className="hidden md:inline pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                ⌘K
              </kbd>
            </Button>

            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {chatOpen && !hideNavbarChatButton && (
        <div className="fixed right-0 top-16 z-[80] h-[calc(100vh-64px)] w-[620px] overflow-hidden rounded-l-[24px] border-l border-border bg-background shadow-2xl">
          <ChatPanel
            spaceSlug={currentSpaceSlug}
            title="Chat"
            embedded={true}
            onClose={() => setChatOpen(false)}
          />
        </div>
      )}
    </>
  );
}