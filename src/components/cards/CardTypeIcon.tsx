'use client';

import { CardType } from './types';

interface CardTypeIconProps {
  type: CardType;
  className?: string;
}

export function CardTypeIcon({ type, className = 'size-full' }: CardTypeIconProps) {
  switch (type) {
    case CardType.EMPTY_CONTEXT:
      // Empty rounded square
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

    case CardType.FULFILLED_CONTEXT:
      // Rounded square with 3 circles in a grid pattern
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

    case CardType.GRAPH_CONTEXT:
      // Graph/whiteboard context icon
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24">
          <path
            d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="m15.5 11-2.5 2.5-2.5-2.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13 13.5V8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case CardType.NODE:
      // Leaf node icon - document/page
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24">
          <path
            d="M21 7v10c0 3-1.5 5-5 5H8c-3.5 0-5-2-5-5V7c0-3 1.5-5 5-5h8c3.5 0 5 2 5 5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14.5 4.5v2c0 1.1.9 2 2 2h2M8 13h4M8 17h8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    default:
      // Fallback to empty context
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
