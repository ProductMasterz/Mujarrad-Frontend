import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus, LogOut, Settings } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";

type UserMenuProps = {
  onClose: () => void;
  anchorEl: HTMLElement | null;
  onLogout: () => void;
};

export function UserMenu({ onClose, anchorEl, onLogout }: UserMenuProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
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


  const rawName =
    (user as any)?.name ||
    (user as any)?.fullName ||
    (user as any)?.username ||
    "";

  const rawEmail =
    (user as any)?.email ||
    "";

  const displayName = typeof rawName === "string" ? rawName.trim() : "";
  const displayEmail = typeof rawEmail === "string" ? rawEmail.trim() : "";

  const initialsSource = displayName || displayEmail || "U";
  const initials = initialsSource
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "U";

  const avatarUrl =
    (user as any)?.avatarUrl ||
    (user as any)?.avatar ||
    (user as any)?.imageUrl ||
    (user as any)?.image ||
    (user as any)?.picture ||
    "";

  if (!anchorEl) return null;

  const rect = anchorEl.getBoundingClientRect();

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] w-[290px] rounded-[14px] bg-white py-[10px] shadow-[0px_10px_30px_0px_rgba(0,0,0,0.10),0px_2px_10px_0px_rgba(0,0,0,0.05)]"
      style={{
        left: `${rect.left}px`,
        bottom: `${window.innerHeight - rect.top}px`,
      }}
    >
      {/* User Info */}
      <button
        className="mx-[10px] mb-[8px] flex w-[calc(100%-20px)] items-center gap-[10px] rounded-[10px] px-[10px] py-[10px] text-left transition-colors hover:bg-[#f7f7f7] group"
        onClick={() => {
          onClose();
        }}
        type="button"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName || displayEmail || "User"}
            className="h-[36px] w-[36px] rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="h-[36px] w-[36px] shrink-0 rounded-full bg-[#7cb5f7] flex items-center justify-center">
            <span
              className="font-['Roboto:Medium',sans-serif] text-[13px] font-medium text-white"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {initials}
            </span>
          </div>
        )}

        <div className="min-w-0 flex-1">
          {displayName && (
            <div
              className="truncate font-['Roboto:Medium',sans-serif] text-[14px] font-medium leading-[18px] text-[#1f1f1f]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {displayName}
            </div>
          )}

          {displayEmail && (
            <div
              className="mt-[2px] break-all font-['Roboto:Regular',sans-serif] text-[12px] font-normal leading-[16px] text-[#7a7a7a]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {displayEmail}
            </div>
          )}

          {!displayName && !displayEmail && (
            <div
              className="font-['Roboto:Regular',sans-serif] text-[12px] font-normal leading-[16px] text-[#7a7a7a]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Account
            </div>
          )}
        </div>

        <ChevronRight
          className="h-[14px] w-[14px] shrink-0 text-[#a3a3a3] opacity-0 transition-opacity group-hover:opacity-100"
          strokeWidth={2}
        />
      </button>

      {/* Divider */}
      <div className="mx-[10px] my-[6px] h-[1px] bg-[#ececec]" />

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
