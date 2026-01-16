'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, ArrowLeft, Plus, Bell, Search, MoreVertical, HelpCircle, Settings, LogOut, User, FileText, MessageSquare, Keyboard, ExternalLink } from 'lucide-react';
import { TabsBar, Tab } from './TabsBar';
import { Breadcrumb } from './Breadcrumb';
import { HomeIcon } from './HomeIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/api/auth.service';

interface BreadcrumbItem {
  id: string;
  title: string;
}

interface AppHeaderProps {
  // Sidebar control
  onMenuClick: () => void;

  // Navigation
  showBackButton?: boolean;
  onBackClick?: () => void;
  breadcrumbPath: BreadcrumbItem[];
  onBreadcrumbClick: (index: number) => void;
  onHomeClick: () => void;

  // Tabs
  tabs: Tab[];
  activeTabId: string;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;

  // Actions
  onAddClick?: () => void;
  onSearchClick?: () => void;
}

interface TooltipButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  tooltip: string;
}

function TooltipButton({ onClick, icon, label, tooltip }: TooltipButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="text-[#828282] hover:text-[#4f4f4f] transition-colors"
        aria-label={label}
      >
        {icon}
      </button>
      {showTooltip && (
        <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-[#333] text-white text-[11px] px-[8px] py-[4px] rounded whitespace-nowrap z-50">
          {tooltip}
        </div>
      )}
    </div>
  );
}

export function AppHeader({
  onMenuClick,
  showBackButton = false,
  onBackClick,
  breadcrumbPath,
  onBreadcrumbClick,
  onHomeClick,
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onNewTab,
  onAddClick,
  onSearchClick,
}: AppHeaderProps) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local state even if API call fails
      logout();
      router.push('/login');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top gray bar with tabs - 33px */}
      <div className="h-[33px] bg-[#f2f2f2] flex items-center px-[9px] gap-[12px]">
        <button
          onClick={onHomeClick}
          className="text-[#828282] hover:text-[#4f4f4f] transition-colors"
          aria-label="Home"
        >
          <HomeIcon />
        </button>

        {/* Tabs */}
        <TabsBar
          tabs={tabs}
          activeTabId={activeTabId}
          onTabClick={onTabClick}
          onTabClose={onTabClose}
          onNewTab={onNewTab}
        />
      </div>

      {/* Main navigation bar - 43px */}
      <div className="h-[43px] bg-white border-b border-[#f2f2f2] flex items-center justify-between px-[9px]">
        {/* Left section */}
        <div className="flex items-center gap-[12px]">
          <button
            onClick={onMenuClick}
            className="text-[#828282] hover:text-[#4f4f4f] transition-colors"
            aria-label="Menu"
          >
            <Menu className="size-6" strokeWidth={1.5} />
          </button>

          {showBackButton && onBackClick && (
            <button
              onClick={onBackClick}
              className="text-[#828282] hover:text-[#4f4f4f] transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="size-6" strokeWidth={1.5} />
            </button>
          )}

          <Breadcrumb path={breadcrumbPath} onBreadcrumbClick={onBreadcrumbClick} />
        </div>

        {/* Right section */}
        <div className="flex items-center gap-[15px]">
          {onAddClick && (
            <TooltipButton
              onClick={onAddClick}
              icon={<Plus className="size-6" strokeWidth={1.5} />}
              label="Add"
              tooltip="Add new node"
            />
          )}

          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="text-[#828282] hover:text-[#4f4f4f] transition-colors"
                aria-label="Notifications"
              >
                <Bell className="size-6" strokeWidth={1.5} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[280px]">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-[#333]">Notifications</p>
              </div>
              <DropdownMenuSeparator />
              <div className="px-3 py-4 text-center">
                <p className="text-[13px] text-[#828282]">No new notifications</p>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {onSearchClick && (
            <TooltipButton
              onClick={onSearchClick}
              icon={<Search className="size-6" strokeWidth={1.5} />}
              label="Search"
              tooltip="Search and jump to node"
            />
          )}

          {/* Help Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="text-[#828282] hover:text-[#4f4f4f] transition-colors"
                aria-label="Help"
              >
                <HelpCircle className="size-6" strokeWidth={1.5} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem className="cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                <span>Documentation</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Keyboard className="mr-2 h-4 w-4" />
                <span>Keyboard shortcuts</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Send feedback</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <ExternalLink className="mr-2 h-4 w-4" />
                <span>What&apos;s new</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* More Options Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="text-[#828282] hover:text-[#4f4f4f] transition-colors"
                aria-label="More options"
              >
                <MoreVertical className="size-6" strokeWidth={1.5} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-[#d4183d] focus:text-[#d4183d]"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
