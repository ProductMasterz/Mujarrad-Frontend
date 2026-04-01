"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { Thread } from "@assistant-ui/react-ui";
import { useChatRuntime } from "@/hooks/api/useChatRuntime";
import "./chat.css";
import { MarkdownMessage } from "./MarkdownMessage";
import { useEffect, useRef, useState } from "react";

function normalizeContent(content: any): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((p) => p?.text ?? "").join("");
  }
  return "";
}

export function ChatWindow() {
  const { runtime } = useChatRuntime();

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);


  // Detect user scroll position
  
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const threshold = 50;

      const atBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < threshold;

      setIsAtBottom(atBottom);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);


  // Auto-scroll on NEW messages 
  
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const observer = new MutationObserver(() => {
      if (!isAtBottom) return;

      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    });

    observer.observe(el, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [isAtBottom]);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="chat-container">

        <div className="chat-header">
          Chat Assistant
        </div>

        <div className="chat-scroll" ref={scrollRef}>
          <Thread
            components={{
              AssistantMessage: (props: any) => {
                const message = props?.message;

                if (!message || !message.content) return null;

                return (
                  <div className="aui-assistant-message-root">
                    <div className="aui-assistant-message-content">
                      <div className="aui-text">
                        <MarkdownMessage
                          content={normalizeContent(message.content)}
                        />
                      </div>
                    </div>
                  </div>
                );
              },
            }}
          />
        </div>

      </div>
    </AssistantRuntimeProvider>
  );
}