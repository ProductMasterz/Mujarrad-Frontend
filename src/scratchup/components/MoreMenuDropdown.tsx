import { useEffect, useRef } from "react";
import { ChevronRight, PenTool, Trash2 } from "lucide-react";

type MoreMenuDropdownProps = {
  onClose: () => void;
  anchorEl: HTMLElement | null;
  onShare?: () => void;
  onOpenInNewTab?: () => void;
  onWhiteboard?: () => void;
  onDelete?: () => void;
  onClearSpace?: () => void;
};

export function MoreMenuDropdown({ onClose, anchorEl, onShare, onOpenInNewTab, onWhiteboard, onDelete, onClearSpace }: MoreMenuDropdownProps) {
  const menuRef = useRef<HTMLDivElement>(null);

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

  const handleMenuItemClick = (action: string) => {
    console.log(`Action: ${action}`);
    // Implement actual actions here
    switch (action) {
      case "share":
        if (onShare) {
          onShare();
        } else {
          alert("Share clicked");
        }
        break;
      case "openNewTab":
        if (onOpenInNewTab) {
          onOpenInNewTab();
        } else {
          alert("Open on new Tab Window clicked");
        }
        break;
      case "openAsNode":
        alert("Open as a node clicked");
        break;
      case "lock":
        alert("Lock clicked");
        break;
      case "whiteboard":
        if (onWhiteboard) {
          onWhiteboard();
        }
        break;
      case "delete":
        if (onDelete) {
          onDelete();
        } else {
          alert("Delete clicked");
        }
        break;
      case "moveTo":
        alert("Move to clicked");
        break;
      case "clearSpace":
        if (onClearSpace) {
          onClearSpace();
        }
        break;
    }
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed bg-white rounded-[12px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08),0px_0px_48px_0px_rgba(0,0,0,0.04)] w-[205px] z-[100] py-[12px] px-[12px]"
      style={{
        left: `${rect.right - 205}px`,
        top: `${rect.bottom + 8}px`,
      }}
    >
      <div className="flex flex-col gap-[8px]">
        <button
          onClick={() => handleMenuItemClick("share")}
          className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#828282] tracking-[-0.08px] leading-[18px] text-left py-[4px] px-[8px] rounded-[6px] hover:bg-[#f5f5f5] transition-colors"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          Share
        </button>
        <button
          onClick={() => handleMenuItemClick("openNewTab")}
          className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#828282] tracking-[-0.08px] leading-[18px] text-left py-[4px] px-[8px] rounded-[6px] hover:bg-[#f5f5f5] transition-colors"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          Open on new Tap Window
        </button>
        <button
          onClick={() => handleMenuItemClick("openAsNode")}
          className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#828282] tracking-[-0.08px] leading-[18px] text-left py-[4px] px-[8px] rounded-[6px] hover:bg-[#f5f5f5] transition-colors"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          Open as a node
        </button>
        <button
          onClick={() => handleMenuItemClick("lock")}
          className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#828282] tracking-[-0.08px] leading-[18px] text-left py-[4px] px-[8px] rounded-[6px] hover:bg-[#f5f5f5] transition-colors"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          Lock
        </button>
        <button
          onClick={() => handleMenuItemClick("whiteboard")}
          className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#828282] tracking-[-0.08px] leading-[18px] text-left py-[4px] px-[8px] rounded-[6px] hover:bg-[#f5f5f5] transition-colors flex items-center gap-[8px]"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          <PenTool className="size-[14px]" />
          Whiteboard
        </button>
        <button
          onClick={() => handleMenuItemClick("delete")}
          className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#828282] tracking-[-0.08px] leading-[18px] text-left py-[4px] px-[8px] rounded-[6px] hover:bg-[#f5f5f5] transition-colors"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          Delete
        </button>
        {onClearSpace && (
          <button
            onClick={() => handleMenuItemClick("clearSpace")}
            className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#d4183d] tracking-[-0.08px] leading-[18px] text-left py-[4px] px-[8px] rounded-[6px] hover:bg-[#fef2f2] transition-colors flex items-center gap-[8px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            <Trash2 className="size-[14px]" />
            Clear Space
          </button>
        )}
        <button
          onClick={() => handleMenuItemClick("moveTo")}
          className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#828282] tracking-[-0.08px] leading-[18px] text-left py-[4px] px-[8px] rounded-[6px] hover:bg-[#f5f5f5] transition-colors flex items-center justify-between"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          Move to
          <ChevronRight className="size-[12px] text-[#828282]" />
        </button>
      </div>
    </div>
  );
}
