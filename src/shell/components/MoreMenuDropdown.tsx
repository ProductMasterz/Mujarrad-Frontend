import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Share2,
  Settings,
  User,
  Command,
  CircleHelp,
} from "lucide-react";

type MoreMenuDropdownProps = {
  onClose: () => void;
  anchorEl: HTMLElement | null;
  onShare?: () => void;
  onShortcuts?: () => void;
};

export function MoreMenuDropdown({
  onClose,
  anchorEl,
  onShare,
  onShortcuts,
}: MoreMenuDropdownProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleProfileClick = () => {
    router.push("/profile");
    onClose();
  };

  const handleSettingsClick = () => {
    router.push("/settings");
    onClose();
  };

  const handleHelpClick = () => {
    router.push("/help");
    onClose();
  };

  const handleShortcutsClick = () => {
    onShortcuts?.();
    onClose();
  };

  const handleShareClick = () => {
    onShare?.();
    onClose();
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
        <button
          onClick={handleProfileClick}
          className="flex items-center gap-[10px] rounded-[8px] px-[12px] py-[8px] text-left text-[13px] leading-[18px] text-foreground transition-colors hover:bg-accent"
        >
          <span className="text-muted-foreground">
            <User className="size-[14px]" />
          </span>
          Profile
        </button>

        <button
          onClick={handleSettingsClick}
          className="flex items-center gap-[10px] rounded-[8px] px-[12px] py-[8px] text-left text-[13px] leading-[18px] text-foreground transition-colors hover:bg-accent"
        >
          <span className="text-muted-foreground">
            <Settings className="size-[14px]" />
          </span>
          Settings
        </button>

        <button
          onClick={handleHelpClick}
          className="flex items-center gap-[10px] rounded-[8px] px-[12px] py-[8px] text-left text-[13px] leading-[18px] text-foreground transition-colors hover:bg-accent"
        >
          <span className="text-muted-foreground">
            <CircleHelp className="size-[14px]" />
          </span>
          Help
        </button>

        <div className="my-[4px] h-px bg-border" />

        <button
          onClick={handleShareClick}
          className="flex items-center gap-[10px] rounded-[8px] px-[12px] py-[8px] text-left text-[13px] leading-[18px] text-foreground transition-colors hover:bg-accent"
        >
          <span className="text-muted-foreground">
            <Share2 className="size-[14px]" />
          </span>
          Share
        </button>

        <button
          onClick={handleShortcutsClick}
          className="flex items-center gap-[10px] rounded-[8px] px-[12px] py-[8px] text-left text-[13px] leading-[18px] text-foreground transition-colors hover:bg-accent"
        >
          <span className="text-muted-foreground">
            <Command className="size-[14px]" />
          </span>
          Shortcuts
        </button>
      </div>
    </div>
  );
}