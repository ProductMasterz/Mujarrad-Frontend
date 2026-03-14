import { Menu, MessageSquare,ArrowLeft, Plus, Bell, Search, MoreVertical, HelpCircle } from "lucide-react";
import { Breadcrumb } from "./Breadcrumb";
import { useState } from "react";
import { useParams } from "next/navigation";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { MoreMenuDropdown } from "./MoreMenuDropdown";
import { AddMenuDropdown } from "./AddMenuDropdown";
import { SearchModal } from "./SearchModal";
import { TabsBar, Tab } from "./TabsBar";
import { HelpDropdown } from "./HelpDropdown";
import { useNavigationStore } from "@/stores/navigationStore";
import { ChatPanel } from "@/components/chat/ChatPanel";

type HeaderProps = {
  onMenuClick: () => void;
  onBackClick: () => void;
  showBackButton: boolean;
  breadcrumbPath: Array<{ id: string; title: string }>;
  onNotificationClick: () => void;
  onSearchClick: () => void;
  onHomeClick: () => void;
  onBreadcrumbClick: (index: number) => void;
  // Add menu actions
  onCreateSpace?: () => void;
  onCreateNode?: () => void;
  onCreateContext?: () => void;
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
};

export function Header({
  onMenuClick,
  onBackClick,
  showBackButton,
  breadcrumbPath,
  onNotificationClick,
  onSearchClick,
  onHomeClick,
  onBreadcrumbClick,
  onCreateSpace,
  onCreateNode,
  onCreateContext,
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
}: HeaderProps) {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<HTMLElement | null>(null);
  const [addMenuAnchor, setAddMenuAnchor] = useState<HTMLElement | null>(null);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null);
  const [helpAnchor, setHelpAnchor] = useState<HTMLElement | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  
  const params = useParams();
  const currentSlug = params?.slug as string | undefined;
  const [chatOpen, setChatOpen] = useState(false);

  // Get tooltip from navigation store
  const addButtonTooltip = useNavigationStore((state) => state.addButtonTooltip);

  const handleNotificationClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleAddClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAddMenuAnchor(event.currentTarget);
  };

  const handleMoreClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMoreMenuAnchor(event.currentTarget);
  };

  const handleHelpClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setHelpAnchor(event.currentTarget);
  };

  const handleSearchClick = () => {
    setSearchModalOpen(true);
    onSearchClick();
  };

  const handleChatClick = () => {
    setChatOpen(true);
  };
  
  return (
    <div className="fixed left-0 right-0 top-0 z-50 border-b border-[#e5e7eb] bg-white/95 backdrop-blur-md">
      {/* Top gray bar with tabs */}
      <div className="flex h-[34px] items-center gap-[12px] border-b border-[#f0f0f0] bg-[#f8fafc] px-[12px]">
        <button
          onClick={onHomeClick}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#111827]"
          aria-label="Home"
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

        {/* Tabs */}
        <TabsBar
          tabs={tabs}
          activeTabId={activeTabId}
          onTabClick={onTabClick}
          onTabClose={onTabClose}
          onNewTab={onNewTab}
        />
      </div>

      {/* Main navigation bar */}
      <div className="flex h-[46px] items-center justify-between bg-white px-[12px]">
        {/* Left section */}
        <div className="flex items-center gap-[12px]">
          <button
            onClick={onMenuClick}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#111827]"
            aria-label="Menu"
          >
            <Menu className="size-6" strokeWidth={1.5} />
          </button>

          {showBackButton && (
            <button
              onClick={onBackClick}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#111827]"
              aria-label="Back"
            >
              <ArrowLeft className="size-6" strokeWidth={1.5} />
            </button>
          )}

          <Breadcrumb path={breadcrumbPath} onBreadcrumbClick={onBreadcrumbClick} />
        </div>

        {/* Right section */}
        <div className="flex items-center gap-[15px]">
          <div className="relative">
            <button
              onClick={handleAddClick}
              onMouseEnter={() => setHoveredButton("add")}
              onMouseLeave={() => setHoveredButton(null)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#111827]"
              aria-label="Add"
            >
              <Plus className="size-6" strokeWidth={1.5} />
            </button>
            {hoveredButton === "add" && !addMenuAnchor && (
              <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-[#333] text-white text-[11px] px-[8px] py-[4px] rounded whitespace-nowrap font-['Roboto:Regular',sans-serif]">
                {addButtonTooltip}
              </div>
            )}
          </div>
          
          <div className="relative">
            <button
              onClick={handleNotificationClick}
              onMouseEnter={() => setHoveredButton("notification")}
              onMouseLeave={() => setHoveredButton(null)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#111827]"
              aria-label="Notifications"
            >
              <Bell className="size-6" strokeWidth={1.5} />
            </button>
            {hoveredButton === "notification" && !notificationAnchor && (
              <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-[#333] text-white text-[11px] px-[8px] py-[4px] rounded whitespace-nowrap font-['Roboto:Regular',sans-serif]">
                Notifications
              </div>
            )}
          </div>

          
          <div className="relative">
            <button
              onClick={handleChatClick}
              onMouseEnter={() => setHoveredButton("chat")}
              onMouseLeave={() => setHoveredButton(null)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#111827]"
              aria-label="Open Chat"
            >
              <MessageSquare className="size-6" strokeWidth={1.5} />
            </button>
            {hoveredButton === "chat" && (
              <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-[#333] text-white text-[11px] px-[8px] py-[4px] rounded whitespace-nowrap font-['Roboto:Regular',sans-serif]">
                Open Chat
              </div>
            )}
          </div>
          

          <div className="relative">
            <button
              onClick={handleSearchClick}
              onMouseEnter={() => setHoveredButton("search")}
              onMouseLeave={() => setHoveredButton(null)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#111827]"
              aria-label="Search"
            >
              <Search className="size-6" strokeWidth={1.5} />
            </button>
            {hoveredButton === "search" && !searchModalOpen && (
              <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-[#333] text-white text-[11px] px-[8px] py-[4px] rounded whitespace-nowrap font-['Roboto:Regular',sans-serif]">
                Search and jump to node
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={handleHelpClick}
              onMouseEnter={() => setHoveredButton("help")}
              onMouseLeave={() => setHoveredButton(null)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#111827]"
              aria-label="Help"
            >
              <HelpCircle className="size-6" strokeWidth={1.5} />
            </button>
            {hoveredButton === "help" && !helpAnchor && (
              <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-[#333] text-white text-[11px] px-[8px] py-[4px] rounded whitespace-nowrap font-['Roboto:Regular',sans-serif]">
                Help & Support
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={handleMoreClick}
              onMouseEnter={() => setHoveredButton("more")}
              onMouseLeave={() => setHoveredButton(null)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#111827]"
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

      {/* Notifications Dropdown */}
      {notificationAnchor && (
        <NotificationsDropdown
          onClose={() => setNotificationAnchor(null)}
          anchorEl={notificationAnchor}
        />
      )}

      {/* Add Menu Dropdown */}
      {addMenuAnchor && (
        <AddMenuDropdown
          onClose={() => setAddMenuAnchor(null)}
          anchorEl={addMenuAnchor}
          onCreateSpace={onCreateSpace}
          onCreateNode={onCreateNode}
          onCreateContext={onCreateContext}
        />
      )}

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

      {/* Help Dropdown */}
      {helpAnchor && (
        <HelpDropdown
          onClose={() => setHelpAnchor(null)}
          anchorEl={helpAnchor}
          onFeedback={onFeedback}
        />
      )}

      {/* Search Modal */}
      {searchModalOpen && (
        <SearchModal
          onClose={() => setSearchModalOpen(false)}
        />
      )}

      {/* Chat Drawer */}
      {chatOpen && (
        <div className="fixed right-0 top-[76px] z-[60] h-[calc(100vh-76px)] w-[620px] border-l border-[#e6e6e6] bg-white shadow-2xl">
          <ChatPanel
            spaceSlug={currentSlug}
            title="Chat"
            embedded={true}
            onClose={() => setChatOpen(false)}
          />
        </div>
      )}
    </div>
  );
}