import { X } from "lucide-react";
import { useEffect } from "react";

type ShortcutsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type ShortcutCategory = {
  name: string;
  shortcuts: Array<{
    label: string;
    keys: string[];
  }>;
};

const shortcutCategories: ShortcutCategory[] = [
  {
    name: "Category name",
    shortcuts: [
      { label: "Add information", keys: ["⌘", "I"] },
      { label: "Open Search", keys: ["⌘", "P"] },
    ],
  },
];

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-[16px] w-[560px] max-h-[80vh] overflow-hidden shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08),0px_0px_48px_0px_rgba(0,0,0,0.04)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-[20px] right-[20px] text-[#828282] hover:text-[#4f4f4f] transition-colors z-10"
          aria-label="Close"
        >
          <X className="size-6" strokeWidth={1.5} />
        </button>

        {/* Content */}
        <div className="p-[30px] overflow-y-auto max-h-[80vh]">
          {shortcutCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-[30px] last:mb-0">
              <h3
                className="font-['Roboto:Medium',sans-serif] font-medium text-[15px] text-black tracking-[-0.24px] leading-[24px] mb-[20px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                {category.name}
              </h3>

              <div className="space-y-[12px]">
                {category.shortcuts.map((shortcut, shortcutIndex) => (
                  <div
                    key={shortcutIndex}
                    className="flex items-center justify-between"
                  >
                    <span
                      className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#4f4f4f] tracking-[-0.08px] leading-[18px]"
                      style={{ fontVariationSettings: "'wdth' 100" }}
                    >
                      {shortcut.label}
                    </span>

                    <div className="flex items-center gap-[6px]">
                      {shortcut.keys.map((key, keyIndex) => (
                        <div
                          key={keyIndex}
                          className="min-w-[32px] h-[24px] px-[8px] flex items-center justify-center bg-[#f5f5f5] rounded-[4px] border border-[#e0e0e0]"
                        >
                          <span
                            className="font-['Roboto:Medium',sans-serif] font-medium text-[11px] text-[#4f4f4f] tracking-[-0.08px]"
                            style={{ fontVariationSettings: "'wdth' 100" }}
                          >
                            {key}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Empty State for more categories */}
          <div className="text-center py-[40px]">
            <p
              className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#bdbdbd] tracking-[-0.08px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              More shortcuts coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
