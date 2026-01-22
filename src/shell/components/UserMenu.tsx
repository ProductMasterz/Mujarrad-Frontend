import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus, LogOut, Settings } from "lucide-react";

type UserMenuProps = {
  onClose: () => void;
  anchorEl: HTMLElement | null;
  onLogout: () => void;
};

export function UserMenu({ onClose, anchorEl, onLogout }: UserMenuProps) {
  const router = useRouter();
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

  return (
    <div
      ref={menuRef}
      className="fixed bg-white rounded-[12px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08),0px_0px_48px_0px_rgba(0,0,0,0.04)] w-[168px] py-[10px] z-[100]"
      style={{
        left: `${rect.left}px`,
        bottom: `${window.innerHeight - rect.top}px`,
      }}
    >
      {/* User Info */}
      <button
        className="w-full px-[10px] py-[8px] flex items-center gap-[10px] hover:bg-[#f5f5f5] transition-colors group"
        onClick={() => {
          console.log("View profile");
          onClose();
        }}
      >
        <div className="size-[30px] rounded-full bg-[#6ab5ff] flex items-center justify-center">
          <span
            className="font-['Roboto:Medium',sans-serif] font-medium text-[12px] text-white tracking-[-0.08px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            HA
          </span>
        </div>
        <div className="flex-1 flex flex-col items-start">
          <span
            className="font-['Roboto:Medium',sans-serif] font-medium text-[13px] text-black tracking-[-0.08px] leading-[18px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Hager Ashraf
          </span>
          <span
            className="font-['Roboto:Regular',sans-serif] font-normal text-[11px] text-[#828282] tracking-[-0.08px] leading-[16px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Hager@gmail.com
          </span>
        </div>
        <ChevronRight className="size-3 text-[#828282] opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
      </button>

      {/* Divider */}
      <div className="h-[1px] bg-[#f2f2f2] mx-[10px] my-[8px]" />

      {/* Add Account */}
      <button
        className="w-full px-[10px] py-[8px] flex items-center gap-[10px] hover:bg-[#f5f5f5] transition-colors"
        onClick={() => {
          console.log("Add account");
          onClose();
        }}
      >
        <Plus className="size-[14px] text-[#e0e0e0]" strokeWidth={2} />
        <span
          className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#828282] tracking-[-0.08px] leading-[18px]"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          Add account
        </span>
      </button>

      {/* Settings */}
      <button
        className="w-full px-[10px] py-[8px] flex items-center gap-[10px] hover:bg-[#f5f5f5] transition-colors"
        onClick={() => {
          router.push('/settings');
          onClose();
        }}
      >
        <Settings className="size-[14px] text-[#e0e0e0]" strokeWidth={2} />
        <span
          className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#828282] tracking-[-0.08px] leading-[18px]"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          Settings
        </span>
      </button>

      {/* Log Out */}
      <button
        className="w-full px-[10px] py-[8px] flex items-center gap-[10px] hover:bg-[#f5f5f5] transition-colors"
        onClick={() => {
          onLogout();
          onClose();
        }}
      >
        <LogOut className="size-[14px] text-[#e0e0e0]" strokeWidth={2} />
        <span
          className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#828282] tracking-[-0.08px] leading-[18px]"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          Log out
        </span>
      </button>
    </div>
  );
}
