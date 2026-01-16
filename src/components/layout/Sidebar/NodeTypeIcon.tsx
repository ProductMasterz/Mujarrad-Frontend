'use client';

import { NodeType } from '@/types/backend-dtos';

interface NodeTypeIconProps {
  type: NodeType;
  hasChildren?: boolean;
  className?: string;
}

export function NodeTypeIcon({ type, hasChildren = false, className = 'size-4' }: NodeTypeIconProps) {
  // CONTEXT with children = Fulfilled Context
  // CONTEXT without children = Empty Context
  // REGULAR = Node

  if (type === NodeType.CONTEXT) {
    if (hasChildren) {
      // Fulfilled Context - Rounded square with 3 circles
      return (
        <svg className={className} fill="none" viewBox="0 0 16 16">
          <rect
            x="1.33"
            y="1.33"
            width="13.34"
            height="13.34"
            rx="4.67"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
          />
          <circle cx="5.2" cy="5.2" r="1.2" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <circle cx="10.8" cy="5.2" r="1.2" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <circle cx="5.3" cy="10.7" r="1.2" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      );
    } else {
      // Empty Context - Rounded square outline
      return (
        <svg className={className} fill="none" viewBox="0 0 16 16">
          <rect
            x="1.33"
            y="1.33"
            width="13.34"
            height="13.34"
            rx="4.67"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
          />
        </svg>
      );
    }
  }

  // Regular Node - Simple document icon
  return (
    <svg className={className} fill="none" viewBox="0 0 16 16">
      <path
        d="M10 1.33H4A1.33 1.33 0 002.67 2.67v10.66A1.33 1.33 0 004 14.67h8a1.33 1.33 0 001.33-1.34V4.67L10 1.33z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 1.33v3.34h3.33"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
