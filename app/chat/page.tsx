'use client';

import { ChatWindow } from "@/components/chat/ChatWindow";

export default function ChatPage() {
  return (
    <div className="h-screen flex justify-center items-center bg-gray-50 p-4">
      <div className="w-full max-w-md h-full">
        <ChatWindow isOpen={false} onClose={function (): void {
          throw new Error("Function not implemented.");
        } } />
      </div>
    </div>
  );
}