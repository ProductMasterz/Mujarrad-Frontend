'use client';
import { Menu, MessageSquare, ArrowLeft, MoreVertical,Bell } from "lucide-react";
import { Breadcrumb } from "./Breadcrumb";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { MoreMenuDropdown } from "./MoreMenuDropdown";
import { TabsBar, Tab } from "./TabsBar";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { NotificationsDropdown } from "./NotificationsDropdown";

type HeaderProps = {
  onMenuClick: () => void;
  onBackClick: () => void;
  showBackButton: boolean;
  breadcrumbPath: Array<{ id: string; title: string }>;
  onHomeClick: () => void;
  onBreadcrumbClick: (index: number) => void;
  // Add menu actions
 
  // More menu actions
  onShare?: () => void;
  onOpenInNewTab?: () => void;
  onOpenAsNode?: () => void;
  onLock?: () => void;
  onGraph?: () => void;
  onWhiteboard?: () => void;
  onDelete?: () => void;
  onClearSpace?: () => void;
  onMoveTo?: () => void;
  // Tabs
  tabs: Tab[];
  activeTabId: string;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
  onFeedback: () => void;
  chatAvailableSpaces?: Array<{ id: string; name: string; slug: string }>;
  onChatChangeSpace?: (nextSpaceSlug: string) => void;
};

export function Header({
  onMenuClick,
  onBackClick,
  showBackButton,
  breadcrumbPath,
  onHomeClick,
  onBreadcrumbClick,
  onShare,
  onOpenInNewTab,
  onOpenAsNode,
  onLock,
  onGraph,
  onWhiteboard,
  onDelete,
  onClearSpace,
  onMoveTo,
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onNewTab,
  onFeedback,
  chatAvailableSpaces = [],
  onChatChangeSpace,
}: HeaderProps) {


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

  // Get tooltip from navigation store

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
  
  return (
    <div className="fixed left-0 right-0 top-0 z-50 border-b border-[#e5e7eb] bg-white/95 backdrop-blur-md dark:border-[#374151] dark:bg-[#111827]/95">
      {/* Top gray bar with tabs */}
      <div className="flex h-[34px] items-center gap-3 border-b border-border bg-muted/40 px-3">
        {tabs.length > 1 && (
          <>
            <button
              onClick={onMenuClick}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Menu"
            >
              <svg className="size-[18px]" viewBox="0 0 18 18" fill="none">
                <path
                  d="M7.04998 2.98498L2.32498 6.85498C1.79998 7.27498 1.37498 8.18998 1.37498 8.87998V13.78C1.37498 15.18 2.51998 16.33 3.91998 16.33H14.08C15.48 16.33 16.625 15.18 16.625 13.785V8.99998C16.625 8.23498 16.14 7.26748 15.545 6.86248L10.12 2.87248C9.26998 2.26498 7.86748 2.29498 7.04998 2.98498Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
                <path
                  d="M9 13.4999V10.9999"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
            </button>

            <TabsBar
              tabs={tabs}
              activeTabId={activeTabId}
              onTabClick={onTabClick}
              onTabClose={onTabClose}
              onNewTab={onNewTab}
            />
          </>
        )}
      </div>
      
      


      {/* Main navigation bar */}
      <div className="flex h-[46px] items-center justify-between bg-background px-3">
        {/* Left section */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#111827] dark:text-[#d1d5db] dark:hover:bg-[#1f2937] dark:hover:text-white"
            aria-label="Menu"
          >
            <Menu className="size-6" strokeWidth={1.5} />
          </button>

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

        {/* Right section */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="relative">
            <button
              ref={notificationButtonRef}
              onClick={handleNotificationsClick}
              onMouseEnter={() => setHoveredButton("notifications")}
              onMouseLeave={() => setHoveredButton(null)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#111827] dark:text-[#d1d5db] dark:hover:bg-[#1f2937] dark:hover:text-white"
              aria-label="Notifications"
            >
              <Bell className="size-6" strokeWidth={1.5} />
            </button>

            {hoveredButton === "notifications" && !notificationsOpen && (
              <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-[#333] text-white text-[11px] px-[8px] py-[4px] rounded whitespace-nowrap">
                Notifications
              </div>
            )}
          </div>
          
          
    

          
          <div className="relative">
            <button
              ref={chatButtonRef}
              onClick={handleChatClick}
              onMouseEnter={() => setHoveredButton("chat")}
              onMouseLeave={() => setHoveredButton(null)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#111827] dark:text-[#d1d5db] dark:hover:bg-[#1f2937] dark:hover:text-white"
              aria-label="Open Chat"
            >
              <MessageSquare className="size-6" strokeWidth={1.5} />
            </button>
            {hoveredButton === "chat" && (
              <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-[#333] text-white text-[11px] px-[8px] py-[4px] rounded whitespace-nowrap font-['Roboto:Regular',sans-serif]">
                {chatOpen ? "Close Chat" : "Open Chat"}
              </div>
            )}
          </div>
          

          <div className="relative">
            <button
              onClick={handleMoreClick}
              onMouseEnter={() => setHoveredButton("more")}
              onMouseLeave={() => setHoveredButton(null)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#111827] dark:text-[#d1d5db] dark:hover:bg-[#1f2937] dark:hover:text-white"
              aria-label="More"
            >
              <MoreVertical className="size-6" strokeWidth={1.5} />
            </button>
            {hoveredButton === "more" && !moreMenuAnchor && (
              <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-[#333] text-white text-[11px] px-[8px] py-[4px] rounded whitespace-nowrap font-['Roboto:Regular',sans-serif]">
                More options
              </div>
            )}
          </div>
        </div>
      </div>



      {/* More Menu Dropdown */}
      {moreMenuAnchor && (
        <MoreMenuDropdown
          onClose={() => setMoreMenuAnchor(null)}
          anchorEl={moreMenuAnchor}
          onShare={onShare}
          onOpenInNewTab={onOpenInNewTab}
          onOpenAsNode={onOpenAsNode}
          onLock={onLock}
          onGraph={onGraph}
          onWhiteboard={onWhiteboard}
          onDelete={onDelete}
          onClearSpace={onClearSpace}
          onMoveTo={onMoveTo}
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


      {/* Chat Drawer */}
      {chatOpen && (
        <div
        ref={chatPanelRef}
        className="fixed right-0 top-[76px] z-[60] h-[calc(100vh-76px)] w-[620px] overflow-hidden rounded-l-[24px] border-l border-[#e6e6e6] bg-white shadow-2xl dark:border-[#374151] dark:bg-[#111827]">
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
    </div>
  );
}