'use client';

import { cn } from '@/lib/utils';
import { SidebarItem, SidebarNode } from './SidebarItem';
import { User, GraduationCap, Command } from 'lucide-react';

interface AppSidebarProps {
  isOpen: boolean;
  items: SidebarNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddChild?: (parentId: string) => void;
  onProfileClick?: () => void;
  onShortcutsClick?: () => void;
}

interface BottomIconProps {
  icon: React.ReactNode;
  tooltip: string;
  onClick?: () => void;
}

function BottomIcon({ icon, tooltip, onClick }: BottomIconProps) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className="text-[#828282] hover:text-[#4f4f4f] transition-colors"
      >
        {icon}
      </button>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-[8px] py-[4px] bg-[#333] text-white text-[11px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {tooltip}
      </div>
    </div>
  );
}

export function AppSidebar({
  isOpen,
  items,
  selectedId,
  onSelect,
  onAddChild,
  onProfileClick,
  onShortcutsClick,
}: AppSidebarProps) {
  return (
    <aside
      className={cn(
        'fixed left-0 top-[76px] h-[calc(100vh-76px)] bg-white border-r border-[#f2f2f2] transition-all duration-300 ease-in-out z-10',
        isOpen ? 'w-[276px]' : 'w-0'
      )}
      style={{ overflow: isOpen ? 'visible' : 'hidden' }}
    >
      <div className="flex flex-col h-full w-[276px]">
        {/* Sidebar Items */}
        <div className="flex-1 pt-[29px] px-[17px] overflow-y-auto">
          <div className="flex flex-col gap-[12px]">
            {items.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                selectedId={selectedId}
                onSelect={onSelect}
                onAddChild={onAddChild}
              />
            ))}
          </div>
        </div>

        {/* Bottom Icons */}
        <div className="flex gap-[90px] items-center px-[17px] pb-[29px]">
          <BottomIcon
            icon={<User className="size-6" />}
            tooltip="Profile"
            onClick={onProfileClick}
          />
          <BottomIcon
            icon={<GraduationCap className="size-6" />}
            tooltip="Learning"
          />
          <BottomIcon
            icon={<Command className="size-6" />}
            tooltip="Shortcuts"
            onClick={onShortcutsClick}
          />
        </div>
      </div>
    </aside>
  );
}
