"use client";

import { useState } from "react";

export default function ChatInput({
  onSend,
}: {
  onSend: (text: string) => void;
}) {
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    onSend(input);
    setInput("");
  };

  return (
    <div className="border-t p-3 flex gap-2">
      <input
        className="flex-1 rounded border px-3 py-2 text-sm focus:outline-none focus:ring"
        placeholder="Type a message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage();
        }}
      />

      <button
        onClick={sendMessage}
        className="rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
      >
        Send
      </button>
    </div>
  );
}