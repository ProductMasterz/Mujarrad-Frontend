'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbSegment {
  label: string;
  href: string;
  isCurrent?: boolean;
}

interface BreadcrumbsProps {
  className?: string;
  segments?: BreadcrumbSegment[]; // Allow manual override
}

/**
 * Breadcrumbs component for navigation context
 * Auto-generates breadcrumbs from URL path or accepts manual segments
 */
export function Breadcrumbs({ className, segments: manualSegments }: BreadcrumbsProps) {
  const pathname = usePathname();

  // If manual segments provided, use them
  if (manualSegments && manualSegments.length > 0) {
    return (
      <nav
        aria-label="Breadcrumb"
        className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}
      >
        {manualSegments.map((segment, index) => (
          <React.Fragment key={segment.href}>
            {index > 0 && <ChevronRight className="h-4 w-4" />}
            {segment.isCurrent ? (
              <span className="font-medium text-foreground" aria-current="page">
                {segment.label}
              </span>
            ) : (
              <Link
                href={segment.href}
                className="hover:text-foreground transition-colors"
              >
                {segment.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  }

  // Auto-generate breadcrumbs from pathname
  const segments = generateSegmentsFromPath(pathname);

  if (segments.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}
    >
      <Link href="/workspaces" className="hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {segments.map((segment, index) => (
        <React.Fragment key={segment.href}>
          <ChevronRight className="h-4 w-4" />
          {segment.isCurrent ? (
            <span className="font-medium text-foreground" aria-current="page">
              {segment.label}
            </span>
          ) : (
            <Link
              href={segment.href}
              className="hover:text-foreground transition-colors"
            >
              {segment.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

/**
 * Generate breadcrumb segments from pathname
 * Handles common patterns:
 * - /workspaces -> []
 * - /workspaces/my-workspace -> [Workspace Name]
 * - /workspaces/my-workspace/node/123 -> [Workspace Name, Node Name]
 */
function generateSegmentsFromPath(pathname: string): BreadcrumbSegment[] {
  const segments: BreadcrumbSegment[] = [];
  const parts = pathname.split('/').filter(Boolean);

  // Skip if only on /workspaces
  if (parts.length === 0 || (parts.length === 1 && parts[0] === 'workspaces')) {
    return segments;
  }

  // Handle /workspaces/:slug
  if (parts[0] === 'workspaces' && parts.length >= 2) {
    const workspaceSlug = parts[1];
    segments.push({
      label: formatLabel(workspaceSlug),
      href: `/workspaces/${workspaceSlug}`,
      isCurrent: parts.length === 2,
    });

    // Handle /workspaces/:slug/node/:id
    if (parts.length >= 4 && parts[2] === 'node') {
      const nodeId = parts[3];
      segments.push({
        label: `Node ${nodeId}`, // Will be replaced by actual node title in page
        href: `/workspaces/${workspaceSlug}/node/${nodeId}`,
        isCurrent: true,
      });
    }
  }

  // Handle /workspace/:slug (deprecated route)
  if (parts[0] === 'workspace' && parts.length >= 2) {
    const workspaceSlug = parts[1];
    segments.push({
      label: formatLabel(workspaceSlug),
      href: `/workspace/${workspaceSlug}`,
      isCurrent: parts.length === 2,
    });

    // Handle /workspace/:slug/node/:id
    if (parts.length >= 4 && parts[2] === 'node') {
      const nodeId = parts[3];
      segments.push({
        label: `Node ${nodeId}`,
        href: `/workspace/${workspaceSlug}/node/${nodeId}`,
        isCurrent: true,
      });
    }
  }

  return segments;
}

/**
 * Format slug into readable label
 * my-workspace -> My Workspace
 */
function formatLabel(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
