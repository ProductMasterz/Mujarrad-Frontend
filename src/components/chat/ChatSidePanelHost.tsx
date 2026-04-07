'use client';

import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useChatPanelStore } from '@/stores/chatPanel.store';
import { ChatWorkspace } from '@/components/chat/ChatWorkspace';
import { Button } from '@/components/ui/button';

export function ChatSidePanelHost() {
  const pathname = usePathname();
  const isOpen = useChatPanelStore((state) => state.isOpen);
  const spaceSlug = useChatPanelStore((state) => state.spaceSlug);
  const closeChat = useChatPanelStore((state) => state.closeChat);

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[90] transition-opacity duration-200 ${
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <aside
        className={`pointer-events-auto absolute bottom-3 right-3 top-3 flex w-[min(560px,calc(100%-1.5rem))] flex-col overflow-visible rounded-2xl border bg-background shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-[105%]'
        }`}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Chat Panel</h2>
          <Button variant="ghost" size="icon" onClick={closeChat}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="min-h-0 flex-1">
          <ChatWorkspace spaceSlug={spaceSlug || 'demo-space'} mode="panel" />
        </div>
      </aside>
    </div>
  );
}
