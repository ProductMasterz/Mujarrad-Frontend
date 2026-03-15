"use client";

import { Thread, Composer } from "@assistant-ui/react-ui";

export function ChatWindow() {
  return (
    <div className="flex flex-col h-full w-full bg-white rounded-xl shadow-sm overflow-hidden">

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <Thread />
      </div>

      <div className="border-t p-4 bg-white">
        <Composer />
      </div>

    </div>
  );
}