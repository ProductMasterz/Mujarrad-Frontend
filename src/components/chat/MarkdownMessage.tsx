"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

type Props = {
  content: any;
};

function extractText(content: any): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((p) => p?.text || "").join("");
  }
  return "";
}

export function MarkdownMessage({ content }: Props) {
  const text = extractText(content);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        a: ({ node, ...props }) => (
          <a {...props} target="_blank" rel="noopener noreferrer" />
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
}