/**
 * NodeIcon component
 * Displays icon for CONTEXT (folder) or REGULAR (document) nodes
 */

import React from 'react';
import type { NodeType } from '@/types/backend-dtos';

interface NodeIconProps {
  nodeType: NodeType | 'CONTEXT' | 'REGULAR';
  className?: string;
}

/**
 * NodeIcon component
 * Shows folder icon for CONTEXT, document icon for REGULAR
 * Memoized for performance in tree rendering (T085)
 */
export const NodeIcon = React.memo(function NodeIcon({ nodeType, className = 'w-4 h-4' }: NodeIconProps) {
  const nodeTypeStr = nodeType.toString().toUpperCase();
  if (nodeTypeStr === 'CONTEXT') {
    return (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
        />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
});
