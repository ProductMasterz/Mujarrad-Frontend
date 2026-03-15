import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  PenTool,
  Trash2,
  Share2,
  ExternalLink,
  Maximize2,
  Lock,
  MoveRight,
  Settings,
  GitBranch,
} from "lucide-react";
import {
  useNavigationStore,
  MoreAction,
  MORE_ACTION_LABELS,
} from "@/stores/navigationStore";

type MoreMenuDropdownProps = {
  onClose: () => void;
  anchorEl: HTMLElement | null;
  onShare?: () => void;
  onOpenInNewTab?: () => void;
  onOpenAsNode?: () => void;
  onLock?: () => void;
  onWhiteboard?: () => void;
  onGraph?: () => void;
  onDelete?: () => void;
  onClearSpace?: () => void;
  onMoveTo?: () => void;
};

const ACTION_ICONS: Partial<Record<MoreAction, React.ReactNode>> = {
  share: <Share2 className="size-[14px]" />,
  open_new_tab: <ExternalLink className="size-[14px]" />,
  open_as_node: <Maximize2 className="size-[14px]" />,
  lock: <Lock className="size-[14px]" />,
  graph: <GitBranch className="size-[14px]" />,
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
  onGraph,
  onDelete,
  onClearSpace,
  onMoveTo,
}: MoreMenuDropdownProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const moreActions = useNavigationStore((state) => state.moreActions);

  const actionHandlers: Record<MoreAction, (() => void) | undefined> = {
    share: onShare,
    open_new_tab: onOpenInNewTab,
    open_as_node: onOpenAsNode,
    lock: onLock,
    graph: onGraph,
    whiteboard: onWhiteboard,
    delete: onDelete,
    clear_space: onClearSpace,
    move_to: onMoveTo,
    settings: () => router.push("/settings"),
  };

  const isDangerousAction = (action: MoreAction) =>
    action === "delete" || action === "clear_space";

  const hasSubmenu = (action: MoreAction) => action === "move_to";

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
  const menuWidth = 205;
  const padding = 8;

  const menuLeft = Math.min(
    Math.max(padding, rect.right - menuWidth),
    window.innerWidth - menuWidth - padding
  );

  const menuTop = Math.min(
    rect.bottom + 8,
    window.innerHeight - 320
  );

  const handleActionClick = (action: MoreAction) => {
    const handler = actionHandlers[action];
    if (handler) {
      handler();
    }
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] min-w-[180px] rounded-[12px] border border-border bg-background px-[8px] py-[8px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08),0px_0px_48px_0px_rgba(0,0,0,0.04)] dark:shadow-[0px_10px_30px_rgba(0,0,0,0.35)]"
      style={{
        left: `${menuLeft}px`,
        top: `${menuTop}px`,
      }}
    >
      <div className="flex flex-col gap-[4px]">
        {moreActions.map((action) => (
          <button
            key={action}
            onClick={() => handleActionClick(action)}
            className={`
              flex items-center gap-[10px] rounded-[8px] px-[12px] py-[8px] text-left
              font-['Roboto:Regular',sans-serif] text-[13px] font-normal tracking-[-0.08px] leading-[18px]
              transition-colors
              ${isDangerousAction(action)
                ? "text-[#d4183d] hover:bg-[#fef2f2] dark:hover:bg-[#3a161c]"
                : "text-foreground hover:bg-accent"
              }
              ${hasSubmenu(action) ? "justify-between" : ""}
            `}
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            <span className="flex items-center gap-[10px]">
              {ACTION_ICONS[action] && (
                <span
                  className={
                    isDangerousAction(action)
                      ? "text-[#d4183d]"
                      : "text-muted-foreground"
                  }
                >
                  {ACTION_ICONS[action]}
                </span>
              )}
              {MORE_ACTION_LABELS[action]}
            </span>

            {hasSubmenu(action) && (
              <ChevronRight className="size-[12px] text-muted-foreground" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}