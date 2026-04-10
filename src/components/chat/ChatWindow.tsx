'use client';

import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { Thread } from '@assistant-ui/react-ui';
import { useChatRuntime } from '@/hooks/api/useChatRuntime';
import './chat.css';

import { useState } from 'react';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { MessagePrimitive } from '@assistant-ui/react';

/* COPY BUTTON `*/
function CopyButton({ message }: any) {
  const [copied, setCopied] = useState(false);

  const getText = () => {
    if (!message) return "";

    // case 1: parts (new API)
    if (Array.isArray(message.parts)) {
      return message.parts
        .map((p: any) => p.text ?? "")
        .join("")
        .trim();
    }

    // case 2: content fallback
    if (typeof message.content === "string") {
      return message.content;
    }

    // case 3: nested content object
    if (message.content?.text) {
      return message.content.text;
    }

    return "";
  };

  const handleCopy = async () => {
    const text = getText();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);

      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`copy-btn ${copied ? "copied" : ""}`}
      title="Copy message"
    >
      {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
    </button>
  );
}

function AssistantMessage({ message }: any) {
  return (
    <MessagePrimitive.Root className="message-wrapper group relative flex justify-start">

      <div className="max-w-3xl text-sm">
        <MessagePrimitive.Content />
      </div>

      <div className="copy-container">
        <CopyButton message={message} />
      </div>

    </MessagePrimitive.Root>
  );
}


function UserMessage({ message }: any) {
  return (
    <MessagePrimitive.Root className="message-wrapper flex justify-end">
      <div className="max-w-3xl rounded-2xl bg-[#2f2f2f] px-4 py-2 text-white text-sm">
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  );
}

export function ChatWindow() {
  const { runtime } = useChatRuntime();

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="chat-container">
        <div className="chat-header">Chat Assistant</div>

        <div className="chat-scroll">
          <Thread
            components={{
              AssistantMessage,
              UserMessage,
            }}
          />
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
}