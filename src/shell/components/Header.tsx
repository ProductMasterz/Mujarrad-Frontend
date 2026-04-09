'use client';

import { MessageSquare, ArrowLeft, MoreVertical, Bell } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { MoreMenuDropdown } from './MoreMenuDropdown';
import { TabsBar, Tab } from './TabsBar';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { NotificationsDropdown } from './NotificationsDropdown';
import { ShortcutsModal } from './ShortcutsModal';
import { useNotificationStore } from '@/stores/notificationStore';

type HeaderProps = {
  onMenuClick: () => void;
  onBackClick: () => void;
  showBackButton: boolean;
  breadcrumbPath: Array<{ id: string; title: string }>;
  onHomeClick: () => void;
  onBreadcrumbClick: (index: number) => void;
  onShare?: () => void;
  tabs: Tab[];
  activeTabId: string;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
  chatAvailableSpaces?: Array<{ id: string; name: string; slug: string }>;
  onChatChangeSpace?: (nextSpaceSlug: string) => void;
  showChatButton?: boolean;
  showUtilityActions?: boolean;
};

export function Header({
  onMenuClick,
  onBackClick,
  showBackButton,
  breadcrumbPath,
  onHomeClick,
  onBreadcrumbClick,
  onShare,
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onNewTab,
  chatAvailableSpaces = [],
  onChatChangeSpace,
  showChatButton = true,
  showUtilityActions = false,
}: HeaderProps) {
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const notificationsPanelRef = useRef<HTMLDivElement>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);
  const chatButtonRef = useRef<HTMLButtonElement>(null);
  const params = useParams();
  const currentSlug = params?.slug as string | undefined;
  const [chatOpen, setChatOpen] = useState(false);
  const notifications = useNotificationStore((state) => state.notifications);
  const notificationSettings = useNotificationStore((state) => state.settings);

  const unreadCount = notifications.filter((item) => !item.read).length;
  const showUnreadBadge =
    notificationSettings.showUnreadBadge &&
    notificationSettings.enabled &&
    unreadCount > 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        chatOpen &&
        chatPanelRef.current &&
        !chatPanelRef.current.contains(target) &&
        chatButtonRef.current &&
        !chatButtonRef.current.contains(target)
      ) {
        setChatOpen(false);
      }

      if (
        notificationsOpen &&
        notificationsPanelRef.current &&
        !notificationsPanelRef.current.contains(target) &&
        notificationButtonRef.current &&
        !notificationButtonRef.current.contains(target)
      ) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [chatOpen, notificationsOpen]);

  const handleMoreClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setChatOpen(false);
    setNotificationsOpen(false);

    if (moreMenuAnchor) {
      setMoreMenuAnchor(null);
      return;
    }

    setMoreMenuAnchor(event.currentTarget);
  };

  const handleChatClick = () => {
    setMoreMenuAnchor(null);
    setNotificationsOpen(false);
    setChatOpen((prev) => !prev);
  };

  const handleNotificationsClick = () => {
    setChatOpen(false);
    setMoreMenuAnchor(null);
    setNotificationsOpen((prev) => !prev);
  };

  const headerTopOffset = 40;

  return (
    <div className="fixed inset-x-0 top-16 z-40 border-b border-[#e5e7eb] bg-white/95 backdrop-blur-md dark:border-[#374151] dark:bg-[#111827]/95">
      {tabs.length > 1 && (
        <div className="flex h-[34px] items-center gap-3 border-b border-border bg-muted/40 px-3">
          <TabsBar
            tabs={tabs}
            activeTabId={activeTabId}
            onTabClick={onTabClick}
            onTabClose={onTabClose}
            onNewTab={onNewTab}
          />
        </div>
      )}

      <div className="flex h-[46px] items-center justify-between bg-background px-6">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button
              onClick={onBackClick}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#111827] dark:text-[#d1d5db] dark:hover:bg-[#1f2937] dark:hover:text-white"
              aria-label="Back"
            >
              <ArrowLeft className="size-6" strokeWidth={1.5} />
            </button>
          )}

          <Breadcrumb path={breadcrumbPath} onBreadcrumbClick={onBreadcrumbClick} />
        </div>

        <div className="flex items-center gap-2">
          {showChatButton && (
            <div className="relative">
              <button
                ref={chatButtonRef}
                onClick={handleChatClick}
                onMouseEnter={() => setHoveredButton('chat')}
                onMouseLeave={() => setHoveredButton(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#111827] dark:text-[#d1d5db] dark:hover:bg-[#1f2937] dark:hover:text-white"
                aria-label="Open Chat"
              >
                <MessageSquare className="size-6" strokeWidth={1.5} />
              </button>

              {hoveredButton === 'chat' && (
                <div className="absolute left-1/2 top-[calc(100%+8px)] -translate-x-1/2 rounded bg-[#333] px-[8px] py-[4px] text-[11px] whitespace-nowrap text-white">
                  {chatOpen ? 'Close Chat' : 'Open Chat'}
                </div>
              )}
            </div>
          )}

          {showUtilityActions && (
            <>
              <div className="relative">
                <button
                  ref={notificationButtonRef}
                  onClick={handleNotificationsClick}
                  onMouseEnter={() => setHoveredButton('notifications')}
                  onMouseLeave={() => setHoveredButton(null)}
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#111827] dark:text-[#d1d5db] dark:hover:bg-[#1f2937] dark:hover:text-white"
                  aria-label="Notifications"
                >
                  <Bell className="size-6" strokeWidth={1.5} />
                  {showUnreadBadge && (
                    <span className="absolute right-1 top-1 flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {hoveredButton === 'notifications' && !notificationsOpen && (
                  <div className="absolute left-1/2 top-[calc(100%+8px)] -translate-x-1/2 rounded bg-[#333] px-[8px] py-[4px] text-[11px] whitespace-nowrap text-white">
                    Notifications
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={handleMoreClick}
                  onMouseEnter={() => setHoveredButton('more')}
                  onMouseLeave={() => setHoveredButton(null)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#111827] dark:text-[#d1d5db] dark:hover:bg-[#1f2937] dark:hover:text-white"
                  aria-label="More"
                >
                  <MoreVertical className="size-6" strokeWidth={1.5} />
                </button>

                {hoveredButton === 'more' && !moreMenuAnchor && (
                  <div className="absolute left-1/2 top-[calc(100%+8px)] -translate-x-1/2 rounded bg-[#333] px-[8px] py-[4px] text-[11px] whitespace-nowrap text-white">
                    More options
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {moreMenuAnchor && (
        <MoreMenuDropdown
          onClose={() => setMoreMenuAnchor(null)}
          anchorEl={moreMenuAnchor}
          onShare={onShare}
          onShortcuts={() => setShowShortcutsModal(true)}
        />
      )}

      {notificationsOpen && notificationButtonRef.current && (
        <div ref={notificationsPanelRef}>
          <NotificationsDropdown
            anchorEl={notificationButtonRef.current}
            onClose={() => setNotificationsOpen(false)}
          />
        </div>
      )}

      {chatOpen && (
        <div
          ref={chatPanelRef}
          className="fixed right-0 z-[60] w-[620px] overflow-hidden rounded-l-[24px] border border-border bg-background shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
          style={{
            top: `${headerTopOffset}px`,
            height: `calc(100vh - ${headerTopOffset}px - 70px)`,
          }}
        >
          <ChatPanel
            spaceSlug={currentSlug}
            title="Chat"
            embedded={true}
            onClose={() => setChatOpen(false)}
            availableSpaces={chatAvailableSpaces}
            onChangeSpace={(nextSpaceSlug) => {
              setChatOpen(false);
              onChatChangeSpace?.(nextSpaceSlug);
            }}
          />
        </div>
      )}

      <ShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </div>
  );
}