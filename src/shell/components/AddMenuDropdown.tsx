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

// Icons for each action
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

  // Action handlers mapping
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

  const handleActionClick = (action: AddAction) => {
    const handler = actionHandlers[action];
    if (handler) {
      handler();
    }
    onClose();
  };

  // Position menu, ensuring it doesn't go off-screen
  const menuLeft = Math.max(8, rect.right - 180);

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
        {addActions.map((action) => (
          <button
            key={action}
            onClick={() => handleActionClick(action)}
            className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#4f4f4f] tracking-[-0.08px] leading-[18px] text-left py-[8px] px-[12px] rounded-[8px] hover:bg-[#f5f5f5] transition-colors flex items-center gap-[10px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            <span className="text-[#828282]">{ACTION_ICONS[action]}</span>
            {ADD_ACTION_LABELS[action]}
          </button>
        ))}
      </div>
    </div>
  );
}
