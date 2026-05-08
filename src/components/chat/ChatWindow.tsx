'use client';

import './chat.css';
import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { Thread } from '@assistant-ui/react-ui';
import { useChatRuntime } from '@/hooks/api/useChatRuntime';
import { useRef, useState } from 'react';
import {
  CheckIcon,
  CopyIcon,
  XIcon,
  MessageCircleIcon,
} from 'lucide-react';

import { MessagePrimitive } from '@assistant-ui/react';
import { getMessageText } from '@/lib/utils/text';

/* COPY BUTTON */
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`copy-btn ${copied ? 'copied' : ''}`}
      title={copied ? 'Copied' : 'Copy'}
    >
      {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
    </button>
  );
}

function AssistantMessage({ message }: any) {
  const contentRef = useRef<HTMLDivElement | null>(null);

  const textToCopy =
    contentRef.current?.innerText?.trim() ||
    getMessageText(message);

  return (
    <MessagePrimitive.Root className="message flex justify-start">
      <div className="bubble-wrapper">
        <div ref={contentRef} className="message-bubble assistant">
          <MessagePrimitive.Content />
        </div>

        <div className="copy-inside">
          <CopyButton value={textToCopy} />
        </div>
      </div>
    </MessagePrimitive.Root>
  );
}

function UserMessage({ message }: any) {
  const contentRef = useRef<HTMLDivElement | null>(null);

  const textToCopy =
    contentRef.current?.innerText?.trim() ||
    getMessageText(message);

  return (
    <MessagePrimitive.Root className="message flex justify-end">
      <div className="bubble-wrapper">
        <div ref={contentRef} className="message-bubble user">
          <MessagePrimitive.Content />
        </div>

        <div className="copy-inside">
          <CopyButton value={textToCopy} />
        </div>
      </div>
    </MessagePrimitive.Root>
  );
}

export function ChatWindow() {
  const { runtime } = useChatRuntime();

  const [open, setOpen] = useState(true);

  return (
    <>
      {/* Floating Open Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-black text-white p-4 rounded-full shadow-lg"
        >
          <MessageCircleIcon size={22} />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <AssistantRuntimeProvider runtime={runtime}>
          <div className="fixed bottom-6 right-6 w-[380px] h-[420px] bg-white shadow-xl rounded-lg border z-50 flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="font-semibold text-sm">
                Assistant
              </h2>

              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <XIcon size={18} />
              </button>
            </div>

            {/* Thread */}
            <div className="flex-1 overflow-hidden">
              <Thread
                components={{
                  AssistantMessage,
                  UserMessage,
                }}
              />
            </div>
          </div>
        </AssistantRuntimeProvider>
      )}
    </>
  );
}