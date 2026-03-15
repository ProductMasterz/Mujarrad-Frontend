import { useEffect, useRef } from "react";
import { FolderPlus, FilePlus, Box } from "lucide-react";
import { useNavigationStore, AddAction, ADD_ACTION_LABELS } from "@/stores/navigationStore";

type AddMenuDropdownProps = {
  onClose: () => void;
  anchorEl: HTMLElement | null;
  onCreateSpace?: () => void;
  onCreateNode?: () => void;
  onCreateContext?: () => void;
};

const ACTION_ICONS: Record<AddAction, React.ReactNode> = {
  create_space: <FolderPlus className="size-[14px]" />,
  create_node: <FilePlus className="size-[14px]" />,
  create_context: <Box className="size-[14px]" />,
};

export function AddMenuDropdown({
  onClose,
  anchorEl,
  onCreateSpace,
  onCreateNode,
  onCreateContext,
}: AddMenuDropdownProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const addActions = useNavigationStore((state) => state.addActions);

  const actionHandlers: Record<AddAction, (() => void) | undefined> = {
    create_space: onCreateSpace,
    create_node: onCreateNode,
    create_context: onCreateContext,
  };

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
  const menuWidth = 180;
  const padding = 8;
  const left = Math.min(
    Math.max(padding, rect.right - menuWidth),
    window.innerWidth - menuWidth - padding
  );

  const handleActionClick = (action: AddAction) => {
    const handler = actionHandlers[action];
    if (handler) {
      handler();
    }
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] min-w-[180px] rounded-[12px] border border-border bg-background px-[8px] py-[8px] text-foreground shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08),0px_0px_48px_0px_rgba(0,0,0,0.04)] dark:shadow-[0px_14px_34px_rgba(0,0,0,0.35)]"
      style={{
        left: `${left}px`,
        top: `${rect.bottom + 8}px`,
      }}
    >
      <div className="flex flex-col gap-[4px]">
        {addActions.map((action) => (
          <button
            key={action}
            onClick={() => handleActionClick(action)}
            className="flex items-center gap-[10px] rounded-[8px] px-[12px] py-[8px] text-left font-['Roboto:Regular',sans-serif] text-[13px] font-normal leading-[18px] tracking-[-0.08px] text-foreground transition-colors hover:bg-accent"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            <span className="text-muted-foreground">{ACTION_ICONS[action]}</span>
            <span>{ADD_ACTION_LABELS[action]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}