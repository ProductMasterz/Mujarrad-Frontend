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
    // In a real app, this would send feedback to a server
    console.log("Feedback submitted:", { feedbackType, subject, message, email });
    alert("Thank you for your feedback! We'll review it shortly.");
    onClose();
    // Reset form
    setFeedbackType("general");
    setSubject("");
    setMessage("");
    setEmail("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[rgba(41,41,41,0.5)]" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white w-[600px] rounded-[16px] shadow-2xl p-[32px]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-[24px] right-[24px] text-[#828282] hover:text-[#333] transition-colors"
        >
          <X className="size-6" strokeWidth={1.5} />
        </button>

        {/* Header */}
        <h2
          className="font-['Roboto:Bold',sans-serif] font-bold text-[24px] tracking-[0.36px] mb-[8px]"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          Send Feedback
        </h2>
        <p
          className="font-['Roboto:Regular',sans-serif] font-normal text-[13px] text-[#828282] tracking-[-0.08px] mb-[24px]"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          We&apos;d love to hear your thoughts, suggestions, or issues you&apos;ve encountered.
        </p>

        {/* Feedback Type */}
        <div className="mb-[20px]">
          <label
            className="font-['Roboto:Medium',sans-serif] font-medium text-[13px] text-[#333] tracking-[-0.08px] block mb-[8px]"
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
                className={`flex-1 h-[36px] rounded-[8px] font-['Roboto:Regular',sans-serif] font-normal text-[13px] tracking-[-0.08px] transition-colors ${
                  feedbackType === type.value
                    ? "bg-[#248bf2] text-white"
                    : "bg-[#f5f5f5] text-[#828282] hover:bg-[#e0e0e0]"
                }`}
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div className="mb-[20px]">
          <label
            className="font-['Roboto:Medium',sans-serif] font-medium text-[13px] text-[#333] tracking-[-0.08px] block mb-[8px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief description of your feedback"
            className="w-full h-[40px] px-[16px] bg-[rgba(201,204,209,0.24)] border border-transparent rounded-[8px] font-['Roboto:Regular',sans-serif] font-normal text-[15px] text-[#333] tracking-[-0.24px] placeholder:text-[#9d9fa3] focus:outline-none focus:border-[#248bf2]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          />
        </div>

        {/* Message */}
        <div className="mb-[20px]">
          <label
            className="font-['Roboto:Medium',sans-serif] font-medium text-[13px] text-[#333] tracking-[-0.08px] block mb-[8px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us more about your feedback..."
            rows={5}
            className="w-full px-[16px] py-[12px] bg-[rgba(201,204,209,0.24)] border border-transparent rounded-[8px] font-['Roboto:Regular',sans-serif] font-normal text-[15px] text-[#333] tracking-[-0.24px] placeholder:text-[#9d9fa3] focus:outline-none focus:border-[#248bf2] resize-none"
            style={{ fontVariationSettings: "'wdth' 100" }}
          />
        </div>

        {/* Email (optional) */}
        <div className="mb-[24px]">
          <label
            className="font-['Roboto:Medium',sans-serif] font-medium text-[13px] text-[#333] tracking-[-0.08px] block mb-[8px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Email (optional)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full h-[40px] px-[16px] bg-[rgba(201,204,209,0.24)] border border-transparent rounded-[8px] font-['Roboto:Regular',sans-serif] font-normal text-[15px] text-[#333] tracking-[-0.24px] placeholder:text-[#9d9fa3] focus:outline-none focus:border-[#248bf2]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          />
          <p
            className="font-['Roboto:Regular',sans-serif] font-normal text-[11px] text-[#bdbdbd] tracking-[-0.08px] mt-[4px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            We&apos;ll only use this to follow up on your feedback
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-[12px] justify-end">
          <button
            onClick={onClose}
            className="h-[36px] px-[20px] rounded-[100px] font-['Roboto:SemiBold',sans-serif] font-semibold text-[14px] text-[#828282] tracking-[-0.24px] hover:bg-[#f5f5f5] transition-colors"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!subject.trim() || !message.trim()}
            className="h-[36px] px-[20px] bg-[#248bf2] rounded-[100px] font-['Roboto:SemiBold',sans-serif] font-semibold text-[14px] text-white tracking-[-0.24px] hover:bg-[#1a6bc4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
