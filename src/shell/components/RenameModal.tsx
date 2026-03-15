'use client';

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

type RenameModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onRename: (newName: string) => Promise<void>;
  entityLabel: string;
};

export function RenameModal({
  isOpen,
  onClose,
  currentName,
  onRename,
  entityLabel,
}: RenameModalProps) {
  const [name, setName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setError(null);
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, currentName]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }

    if (name === currentName) {
      onClose();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onRename(name.trim());
      onClose();
    } catch (err) {
      console.error("Failed to rename:", err);
      setError("Failed to rename. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-[400px] rounded-[16px] border border-border bg-background text-foreground shadow-2xl">
        <div className="flex items-center justify-between px-[24px] pb-[12px] pt-[20px]">
          <h2
            className="font-['Roboto:SemiBold',sans-serif] text-[18px] font-semibold tracking-[-0.24px] text-foreground"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Rename {entityLabel}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-[24px] pb-[24px]">
          <div className="mb-[16px]">
            <label
              htmlFor="rename-input"
              className="mb-[8px] block font-['Roboto:Regular',sans-serif] text-[13px] font-normal tracking-[-0.08px] text-muted-foreground"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Name
            </label>
            <input
              ref={inputRef}
              id="rename-input"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              disabled={isLoading}
              className="h-[40px] w-full rounded-[8px] border border-border bg-background px-[12px] font-['Roboto:Regular',sans-serif] text-[15px] font-normal tracking-[-0.24px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:bg-muted"
              style={{ fontVariationSettings: "'wdth' 100" }}
              placeholder={`Enter ${entityLabel.toLowerCase()} name`}
            />
            {error && (
              <p
                className="mt-[8px] font-['Roboto:Regular',sans-serif] text-[12px] font-normal tracking-[-0.08px] text-destructive"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-[12px]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="h-[36px] rounded-[100px] bg-secondary px-[20px] font-['Roboto:SemiBold',sans-serif] text-[14px] font-semibold tracking-[-0.24px] text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex h-[36px] items-center gap-[8px] rounded-[100px] bg-[#248bf2] px-[20px] font-['Roboto:SemiBold',sans-serif] text-[14px] font-semibold tracking-[-0.24px] text-white transition-colors hover:bg-[#1a6bc4] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Renaming...
                </>
              ) : (
                "Rename"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}