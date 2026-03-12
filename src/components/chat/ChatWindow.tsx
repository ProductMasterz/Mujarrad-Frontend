import { useChat } from "@/hooks/api/useChat";
import { useState, useRef, useEffect } from "react";


export function ChatWindow() {
  const { messages, sendMessage, loading } = useChat();
  
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

 const handleSend = () => {
  if (input.trim() === "") return;

  sendMessage(input);
  setInput("");
};
  

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter, allow Shift+Enter for new line
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
  <div className="flex flex-col h-full w-full overflow-hidden border rounded-lg">

  {/* Messages area */}
  <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
    {messages.map((msg, idx) => (
      <div
        key={idx}
        className={`flex ${
          msg.role === "user" ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`px-3 py-2 rounded-lg max-w-[75%] text-sm ${
            msg.role === "user"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          {msg.content}
        </div>
      </div>
    ))}
    <div ref={messagesEndRef} />
  </div>

  {/* Input area */}
  <div className="border-t p-2 flex items-center gap-2 bg-white">
    <textarea
      ref={textareaRef}
      className="flex-1 resize-none rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring focus:border-blue-300"
      placeholder="Ask something..."
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={handleKeyDown}
      rows={1}
    />

    <button
      onClick={handleSend}
      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm"
    >
      Send
    </button>
  </div>

</div>
  );
}