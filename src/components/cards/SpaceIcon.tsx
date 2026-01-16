'use client';

interface SpaceIconProps {
  className?: string;
}

/**
 * Space icon - represents a top-level space container
 * Different from NodeTypeIcon which represents nodes within a space
 */
export function SpaceIcon({ className = 'size-full' }: SpaceIconProps) {
  // Cube/box icon representing a space/container
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="M12 2L2 7l10 5 10-5-10-5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 17l10 5 10-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 12l10 5 10-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
