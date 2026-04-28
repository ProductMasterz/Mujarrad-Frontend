'use client';

import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { Thread } from '@assistant-ui/react-ui';
import { useChatRuntime } from '@/hooks/api/useChatRuntime';
import './chat.css';

import { useRef, useState } from 'react';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { MessagePrimitive } from '@assistant-ui/react';
import { getMessageText } from '@/lib/utils/text';
import { ConversationList } from './ConversationList';

/* COPY BUTTON `*/
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

  const textToCopy = contentRef.current?.innerText?.trim() || getMessageText(message);

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

  const textToCopy = contentRef.current?.innerText?.trim() || getMessageText(message);

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
  const { runtime, startNewConversation, switchConversation, conversationId, deleteConversation } =
    useChatRuntime();

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
          {/* NEW: input section */}
          <div className="chat-input-area">
            <div className="new-chat-wrapper">
              <button onClick={startNewConversation} className="new-chat-btn">
                New Chat
              </button>
              <button
                onClick={() => {
                  if (!conversationId) return;

                  const confirmed = window.confirm(
                    'Are you sure you want to delete this conversation?'
                  );

                  if (confirmed) {
                    deleteConversation(conversationId);
                  }
                }}
                className="delete-convo-btn"
                disabled={!conversationId}
              >
                Delete
              </button>
            </div>
          </div>

          <ConversationList activeId={conversationId} onSelect={switchConversation} />
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
}
