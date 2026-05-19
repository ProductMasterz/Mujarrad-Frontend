import { useEffect, useRef } from "react";
import { MessageCircle, Mail, BookOpen, HelpCircle } from "lucide-react";

type HelpDropdownProps = {
  onClose: () => void;
  anchorEl: HTMLElement | null;
  onFeedback: () => void;
};

export function HelpDropdown({ onClose, anchorEl, onFeedback }: HelpDropdownProps) {
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
    switch (action) {
      case "feedback":
        onFeedback();
        break;
      case "contact":
        // Open contact us (could be mailto or external link)
        window.open("mailto:support@example.com", "_blank");
        break;
      case "help":
        window.location.href = '/docs';
        break;
      case "about":
        alert("About this application...");
        break;
    }
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] w-[205px] rounded-[12px] border border-border bg-background px-[12px] py-[12px] text-foreground shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08),0px_0px_48px_0px_rgba(0,0,0,0.04)]"
      style={{
        left: `${rect.right - 205}px`,
        top: `${rect.bottom + 8}px`,
      }}
    >
      <div className="flex flex-col gap-[8px]">
        <button
          onClick={() => handleMenuItemClick("feedback")}
          className="flex items-center gap-[8px] rounded-[6px] px-[8px] py-[4px] text-left font-['Roboto:Regular',sans-serif] text-[13px] font-normal leading-[18px] tracking-[-0.08px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          <MessageCircle className="size-4" strokeWidth={1.5} />
          Send Feedback
        </button>
        <button
          onClick={() => handleMenuItemClick("contact")}
          className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#828282] tracking-[-0.08px] leading-[18px] text-left py-[4px] px-[8px] rounded-[6px] hover:bg-[#f5f5f5] transition-colors flex items-center gap-[8px]"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          <Mail className="size-4" strokeWidth={1.5} />
          Contact Us
        </button>
        <button
          onClick={() => handleMenuItemClick("help")}
          className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#828282] tracking-[-0.08px] leading-[18px] text-left py-[4px] px-[8px] rounded-[6px] hover:bg-[#f5f5f5] transition-colors flex items-center gap-[8px]"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          <BookOpen className="size-4" strokeWidth={1.5} />
          Help Center
        </button>
        <button
          onClick={() => handleMenuItemClick("about")}
          className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#828282] tracking-[-0.08px] leading-[18px] text-left py-[4px] px-[8px] rounded-[6px] hover:bg-[#f5f5f5] transition-colors flex items-center gap-[8px]"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          <HelpCircle className="size-4" strokeWidth={1.5} />
          About
        </button>
      </div>
    </div>
  );
}
