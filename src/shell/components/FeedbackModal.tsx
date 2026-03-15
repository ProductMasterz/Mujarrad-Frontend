"use client";

import { X } from "lucide-react";
import { useState } from "react";

type FeedbackModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState<"bug" | "feature" | "general">("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    console.log("Feedback submitted:", { feedbackType, subject, message, email });
    onClose();
    setFeedbackType("general");
    setSubject("");
    setMessage("");
    setEmail("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-[600px] rounded-[16px] border border-border bg-background p-[32px] text-foreground shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-[24px] top-[24px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-6" strokeWidth={1.5} />
        </button>

        <h2
          className="mb-[8px] font-['Roboto:Bold',sans-serif] text-[24px] font-bold tracking-[0.36px] text-foreground"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          Send Feedback
        </h2>
        <p
          className="mb-[24px] font-['Roboto:Regular',sans-serif] text-[13px] font-normal tracking-[-0.08px] text-muted-foreground"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          We&apos;d love to hear your thoughts, suggestions, or issues you&apos;ve encountered.
        </p>

        <div className="mb-[20px]">
          <label
            className="mb-[8px] block font-['Roboto:Medium',sans-serif] text-[13px] font-medium tracking-[-0.08px] text-foreground"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Feedback Type
          </label>
          <div className="flex gap-[12px]">
            {[
              { value: "bug", label: "Bug Report" },
              { value: "feature", label: "Feature Request" },
              { value: "general", label: "General Feedback" },
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setFeedbackType(type.value as "bug" | "feature" | "general")}
                className={`h-[36px] flex-1 rounded-[8px] font-['Roboto:Regular',sans-serif] text-[13px] font-normal tracking-[-0.08px] transition-colors ${
                  feedbackType === type.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-accent"
                }`}
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-[20px]">
          <label
            className="mb-[8px] block font-['Roboto:Medium',sans-serif] text-[13px] font-medium tracking-[-0.08px] text-foreground"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief description of your feedback"
            className="h-[40px] w-full rounded-[8px] border border-border bg-background px-[16px] font-['Roboto:Regular',sans-serif] text-[15px] font-normal tracking-[-0.24px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            style={{ fontVariationSettings: "'wdth' 100" }}
          />
        </div>

        <div className="mb-[20px]">
          <label
            className="mb-[8px] block font-['Roboto:Medium',sans-serif] text-[13px] font-medium tracking-[-0.08px] text-foreground"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us more about your feedback..."
            rows={5}
            className="w-full resize-none rounded-[8px] border border-border bg-background px-[16px] py-[12px] font-['Roboto:Regular',sans-serif] text-[15px] font-normal tracking-[-0.24px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            style={{ fontVariationSettings: "'wdth' 100" }}
          />
        </div>

        <div className="mb-[24px]">
          <label
            className="mb-[8px] block font-['Roboto:Medium',sans-serif] text-[13px] font-medium tracking-[-0.08px] text-foreground"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Email (optional)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="h-[40px] w-full rounded-[8px] border border-border bg-background px-[16px] font-['Roboto:Regular',sans-serif] text-[15px] font-normal tracking-[-0.24px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            style={{ fontVariationSettings: "'wdth' 100" }}
          />
          <p
            className="mt-[4px] font-['Roboto:Regular',sans-serif] text-[11px] font-normal tracking-[-0.08px] text-muted-foreground"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            We&apos;ll only use this to follow up on your feedback
          </p>
        </div>

        <div className="flex justify-end gap-[12px]">
          <button
            onClick={onClose}
            className="h-[36px] rounded-[100px] px-[20px] font-['Roboto:SemiBold',sans-serif] text-[14px] font-semibold tracking-[-0.24px] text-muted-foreground transition-colors hover:bg-accent"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!subject.trim() || !message.trim()}
            className="h-[36px] rounded-[100px] bg-primary px-[20px] font-['Roboto:SemiBold',sans-serif] text-[14px] font-semibold tracking-[-0.24px] text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
}