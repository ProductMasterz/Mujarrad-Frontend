import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, PenTool, Trash2, Share2, ExternalLink, Maximize2, Lock, MoveRight, Settings } from "lucide-react";
import { useNavigationStore, MoreAction, MORE_ACTION_LABELS } from "@/stores/navigationStore";

type MoreMenuDropdownProps = {
  onClose: () => void;
  anchorEl: HTMLElement | null;
  onShare?: () => void;
  onOpenInNewTab?: () => void;
  onOpenAsNode?: () => void;
  onLock?: () => void;
  onWhiteboard?: () => void;
  onDelete?: () => void;
  onClearSpace?: () => void;
  onMoveTo?: () => void;
};

// Icons for each action
const ACTION_ICONS: Partial<Record<MoreAction, React.ReactNode>> = {
  share: <Share2 className="size-[14px]" />,
  open_new_tab: <ExternalLink className="size-[14px]" />,
  open_as_node: <Maximize2 className="size-[14px]" />,
  lock: <Lock className="size-[14px]" />,
  whiteboard: <PenTool className="size-[14px]" />,
  delete: <Trash2 className="size-[14px]" />,
  clear_space: <Trash2 className="size-[14px]" />,
  move_to: <MoveRight className="size-[14px]" />,
  settings: <Settings className="size-[14px]" />,
};

export function MoreMenuDropdown({
  onClose,
  anchorEl,
  onShare,
  onOpenInNewTab,
  onOpenAsNode,
  onLock,
  onWhiteboard,
  onDelete,
  onClearSpace,
  onMoveTo,
}: MoreMenuDropdownProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const moreActions = useNavigationStore((state) => state.moreActions);

  // Action handlers mapping
  const actionHandlers: Record<MoreAction, (() => void) | undefined> = {
    share: onShare,
    open_new_tab: onOpenInNewTab,
    open_as_node: onOpenAsNode,
    lock: onLock,
    whiteboard: onWhiteboard,
    delete: onDelete,
    clear_space: onClearSpace,
    move_to: onMoveTo,
    settings: () => router.push('/settings'),
  };

  // Special styling for dangerous actions
  const isDangerousAction = (action: MoreAction) =>
    action === 'delete' || action === 'clear_space';

  // Actions that show chevron (sub-menu indicator)
  const hasSubmenu = (action: MoreAction) => action === 'move_to';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        anchorEl &&
        !anchorEl.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, anchorEl]);

  if (!anchorEl) return null;

  const rect = anchorEl.getBoundingClientRect();

  const handleActionClick = (action: MoreAction) => {
    const handler = actionHandlers[action];
    if (handler) {
      handler();
    }
    onClose();
  };

  // Position menu, ensuring it doesn't go off-screen
  const menuLeft = Math.max(8, rect.right - 205);

  return (
    <div
      ref={menuRef}
      className="fixed bg-white rounded-[12px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08),0px_0px_48px_0px_rgba(0,0,0,0.04)] min-w-[180px] z-[100] py-[8px] px-[8px]"
      style={{
        left: `${menuLeft}px`,
        top: `${rect.bottom + 8}px`,
      }}
    >
      <div className="flex flex-col gap-[4px]">
        {moreActions.map((action) => (
          <button
            key={action}
            onClick={() => handleActionClick(action)}
            className={`
              font-['Roboto:Regular',sans-serif] font-normal text-[13px] tracking-[-0.08px] leading-[18px]
              text-left py-[8px] px-[12px] rounded-[8px] transition-colors flex items-center gap-[10px]
              ${isDangerousAction(action)
                ? 'text-[#d4183d] hover:bg-[#fef2f2]'
                : 'text-[#4f4f4f] hover:bg-[#f5f5f5]'
              }
              ${hasSubmenu(action) ? 'justify-between' : ''}
            `}
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            <span className="flex items-center gap-[10px]">
              {ACTION_ICONS[action] && (
                <span className={isDangerousAction(action) ? 'text-[#d4183d]' : 'text-[#828282]'}>
                  {ACTION_ICONS[action]}
                </span>
              )}
              {MORE_ACTION_LABELS[action]}
            </span>
            {hasSubmenu(action) && (
              <ChevronRight className="size-[12px] text-[#828282]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
