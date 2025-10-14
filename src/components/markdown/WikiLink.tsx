/**
 * WikiLink component
 * Renders clickable wiki-links with navigation
 */

import React from 'react';
import Link from 'next/link';

interface WikiLinkProps {
  targetTitle: string;
  displayText?: string;
  targetNodeId?: string | null;
  spaceSlug: string;
  onClick?: (targetTitle: string) => void;
}

/**
 * WikiLink component
 * Displays a clickable link to another node
 * Shows placeholder styling if target doesn't exist
 * Memoized for performance in markdown with many links (T085)
 */
export const WikiLink = React.memo(function WikiLink({
  targetTitle,
  displayText,
  targetNodeId,
  spaceSlug,
  onClick,
}: WikiLinkProps) {
  const text = displayText || targetTitle;
  const isPlaceholder = !targetNodeId;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick(targetTitle);
    }
  };

  // If target exists, link to it
  if (targetNodeId) {
    return (
      <Link
        href={`/space/${spaceSlug}/node/${targetNodeId}`}
        className="text-blue-600 hover:text-blue-800 underline"
        onClick={handleClick}
      >
        {text}
      </Link>
    );
  }

  // If target doesn't exist (placeholder), show as unresolved
  return (
    <span
      className="text-red-500 cursor-pointer underline decoration-dotted"
      onClick={handleClick}
      title={`"${targetTitle}" does not exist (click to create)`}
    >
      {text}
    </span>
  );
});
