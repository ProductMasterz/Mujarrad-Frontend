'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { Search, Home, Network, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  // Get current space slug from URL if available
  const currentSpaceSlug = params?.slug as string | undefined;

  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  // Keyboard shortcut for command palette (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <CommandPalette
        open={searchOpen}
        onOpenChange={setSearchOpen}
        currentSpaceSlug={currentSpaceSlug}
      />
      <nav className={`border-b bg-background ${className || ''}`}>
      <div className="flex h-16 items-center px-6 gap-6">
        {/* Logo */}
        <Link href="/spaces" className="flex items-center gap-2 font-semibold text-lg">
          <Network className="h-6 w-6" />
          <span>Mujarrad</span>
        </Link>

        {/* Navigation Links */}
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
        </div>

        {/* Search */}
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
        </div>

        {/* User Menu */}
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
    </nav>
    </>
  );
}
