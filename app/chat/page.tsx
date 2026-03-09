"use client";

import { useState } from "react";
import ChatContainer from "@/components/chat/ChatContainer";
import { MessageSquare, X } from "lucide-react";

export default function ChatPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex h-full w-full">

      {/* Main empty workspace */}
      <div className="flex-1" />

      {/* Toggle Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-6 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600"
        >
          <MessageSquare className="h-5 w-5" />
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div className="fixed right-0 top-16 h-[calc(100vh-64px)] w-[420px] border-l bg-white shadow-xl flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <span className="font-medium">Chat</span>
            <button onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Chat */}
          <div className="flex-1">
            <ChatContainer />
          </div>
        </div>
      )}
    </div>
  );
}