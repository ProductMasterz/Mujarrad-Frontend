'use client';

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

type RenameModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onRename: (newName: string) => Promise<void>;
  entityLabel: string; // "Space" | "Node" | "Context"
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

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setError(null);
      setIsLoading(false);
      // Focus input after modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, currentName]);

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[rgba(41,41,41,0.5)]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-[400px] rounded-[16px] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] pt-[20px] pb-[12px]">
          <h2
            className="font-['Roboto:SemiBold',sans-serif] font-semibold text-[18px] text-[#333] tracking-[-0.24px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Rename {entityLabel}
          </h2>
          <button
            onClick={onClose}
            className="text-[#828282] hover:text-[#333] transition-colors"
          >
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-[24px] pb-[24px]">
          <div className="mb-[16px]">
            <label
              htmlFor="rename-input"
              className="block font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#828282] tracking-[-0.08px] mb-[8px]"
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
              className="w-full h-[40px] px-[12px] border border-[#e0e0e0] rounded-[8px] font-['Roboto:Regular',sans-serif] font-normal text-[15px] text-[#333] tracking-[-0.24px] outline-none focus:border-[#248bf2] transition-colors disabled:bg-[#f5f5f5] disabled:cursor-not-allowed"
              style={{ fontVariationSettings: "'wdth' 100" }}
              placeholder={`Enter ${entityLabel.toLowerCase()} name`}
            />
            {error && (
              <p
                className="mt-[8px] font-['Roboto:Regular',sans-serif] font-normal text-[12px] text-[#d4183d] tracking-[-0.08px]"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                {error}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-[12px]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="h-[36px] px-[20px] bg-[#f5f5f5] rounded-[100px] font-['Roboto:SemiBold',sans-serif] font-semibold text-[14px] text-[#333] tracking-[-0.24px] hover:bg-[#e5e5e5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="h-[36px] px-[20px] bg-[#248bf2] rounded-[100px] font-['Roboto:SemiBold',sans-serif] font-semibold text-[14px] text-white tracking-[-0.24px] hover:bg-[#1a6bc4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-[8px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
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
