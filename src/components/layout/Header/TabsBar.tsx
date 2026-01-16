'use client';

import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Tab {
  id: string;
  title: string;
  path: string;
}

interface TabsBarProps {
  tabs: Tab[];
  activeTabId: string;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
}

export function TabsBar({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onNewTab,
}: TabsBarProps) {
  return (
    <div className="flex items-center gap-[4px] h-full">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;

        return (
          <div
            key={tab.id}
            className={cn(
              'group relative flex items-center gap-[8px] h-[28px] px-[12px] rounded-[6px] cursor-pointer transition-colors max-w-[200px]',
              isActive
                ? 'bg-white text-[#333]'
                : 'bg-transparent text-[#828282] hover:bg-white/10'
            )}
            onClick={() => onTabClick(tab.id)}
          >
            <span
              className={cn(
                'font-normal text-[13px] tracking-[-0.08px] truncate',
                isActive ? 'text-[#333]' : 'text-[#828282]'
              )}
            >
              {tab.title}
            </span>

            {tabs.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
                className={cn(
                  'flex items-center justify-center size-4 rounded-[4px] transition-opacity',
                  isActive
                    ? 'opacity-100 hover:bg-[#f5f5f5]'
                    : 'opacity-0 group-hover:opacity-100 hover:bg-white/20'
                )}
              >
                <X className="size-3" strokeWidth={1.5} />
              </button>
            )}
          </div>
        );
      })}

      {/* New Tab Button */}
      <button
        onClick={onNewTab}
        className="flex items-center justify-center size-[28px] rounded-[6px] text-[#828282] hover:bg-white/10 transition-colors"
        aria-label="New tab"
      >
        <Plus className="size-4" strokeWidth={1.5} />
      </button>
    </div>
  );
}
