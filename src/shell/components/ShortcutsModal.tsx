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
    name: "General",
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
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative max-h-[80vh] w-[560px] overflow-hidden rounded-[16px] border border-border bg-background text-foreground shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08),0px_0px_48px_0px_rgba(0,0,0,0.04)] dark:shadow-[0px_16px_40px_rgba(0,0,0,0.35)]">
        <button
          onClick={onClose}
          className="absolute right-[20px] top-[20px] z-10 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-6" strokeWidth={1.5} />
        </button>

        <div className="max-h-[80vh] overflow-y-auto p-[30px]">
          {shortcutCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-[30px] last:mb-0">
              <h3
                className="mb-[20px] font-['Roboto:Medium',sans-serif] text-[15px] font-medium leading-[24px] tracking-[-0.24px] text-foreground"
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
                      className="font-['Roboto:Regular',sans-serif] text-[13px] font-normal leading-[18px] tracking-[-0.08px] text-foreground"
                      style={{ fontVariationSettings: "'wdth' 100" }}
                    >
                      {shortcut.label}
                    </span>

                    <div className="flex items-center gap-[6px]">
                      {shortcut.keys.map((key, keyIndex) => (
                        <div
                          key={keyIndex}
                          className="flex h-[24px] min-w-[32px] items-center justify-center rounded-[4px] border border-border bg-secondary px-[8px]"
                        >
                          <span
                            className="font-['Roboto:Medium',sans-serif] text-[11px] font-medium tracking-[-0.08px] text-foreground"
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

          <div className="py-[40px] text-center">
            <p
              className="font-['Roboto:Regular',sans-serif] text-[13px] font-normal tracking-[-0.08px] text-muted-foreground"
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