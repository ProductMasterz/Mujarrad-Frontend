'use client';

import { useState } from 'react';
import { Rocket, AlertTriangle, Wrench, ChevronDown, ChevronRight, Monitor, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Release {
  version: string;
  title: string;
  date: string;
  major: boolean;
  features?: string[];
  frontendFeatures?: string[];
  breakingChanges?: string[];
  infrastructure?: string[];
}

const releases: Release[] = [
  {
    version: 'v1.0',
    title: 'Features 014 + Batch 015 + Batch 016',
    date: '2026-06-01',
    major: true,
    features: [
      'Organizations -- INDIVIDUAL (auto) + TEAM (manual) with OWNER/ADMIN/MEMBER roles',
      'The Void -- personal spaceless holding area for quick notes',
      'The Blank -- per-space default context for unorganized nodes',
      'Context-Scoped Access -- create/read nodes through their parent context',
      'Block Architecture -- parent-child nodes with parent_node_id, atomic creation',
      'Node Migration -- copy nodes between spaces (replaces move)',
      'Schema Lock -- 4-level cascade: space, schema, node, attribute',
      'Virtual Contexts -- cross-space connections stored as CONTEXT nodes',
      'Nested Contexts -- contexts inside contexts',
      'Schema Enforcement -- NONE/WARN/STRICT on context types',
      'Pagination -- ALL list endpoints return PageResponse',
      'Context Type Management -- schema viewer and editor',
    ],
    frontendFeatures: [
      'Organization switcher in sidebar',
      'Lock management -- content lock vs schema lock with visual indicators',
      'The Void page -- quick notes with assign-to-space',
      'The Blank page -- unorganized nodes with assign-to-context',
      'Node migration dialog',
      'Context detail page with NodeGrid',
      'Schema viewer and editor',
      'Universal "New" button -- one button everywhere',
      'SpaceShell + NodeGrid -- unified page experience',
      'Full documentation at /docs',
    ],
    breakingChanges: [
      'ASSUMPTION node type removed -- use REGULAR',
      'TEMPLATE node type removed',
      'All list endpoints return PageResponse instead of raw arrays',
      'Flat POST /spaces/{slug}/nodes creates in The Blank (deprecated -- use context-scoped)',
    ],
    infrastructure: [
      '7 database migrations (V031-V039)',
      '923 tests passing, 0 failures',
      'JWT issuer validation',
      'Centralized ResponseMapper',
    ],
  },
  {
    version: 'v0.5',
    title: 'Space Modes & Context Types',
    date: '2026-05',
    major: false,
    features: [
      'Space modes: CONFIGURATION and PRODUCTION for BACKEND spaces',
      'Context types with attribute schemas',
      'Schema relationship definitions with cardinality',
      'Batch upload endpoint',
    ],
  },
  {
    version: 'v0.4',
    title: 'Two-Way Relationships',
    date: '2026-04',
    major: false,
    features: [
      'Bidirectional attribute system',
      'Cycle detection in relationships',
      'Cardinality enforcement',
      'Rate limiting with Caffeine cache',
    ],
  },
  {
    version: 'v0.3',
    title: 'Database Migration',
    date: '2026-03',
    major: false,
    features: [
      'Migrated from Supabase to Render-managed PostgreSQL 17.6',
      'Flyway migration framework',
    ],
  },
  {
    version: 'v0.2',
    title: 'Swagger & API Keys',
    date: '2026-02',
    major: false,
    features: [
      'SpringDoc OpenAPI 2.x integration',
      'Swagger UI at /swagger-ui',
      'B2B API key authentication (X-API-Key + X-API-Secret)',
    ],
  },
  {
    version: 'v0.1',
    title: 'MVP',
    date: '2026-01',
    major: false,
    features: [
      'Node CRUD with versioning',
      'Space management',
      'JWT authentication + Google OAuth2',
      'Basic attribute/relationship management',
    ],
  },
];

function ReleaseCard({ release, defaultOpen }: { release: Release; defaultOpen: boolean }) {
  const [expanded, setExpanded] = useState(defaultOpen);

  return (
    <div className="relative pl-8 md:pl-12 pb-10">
      {/* Timeline dot */}
      <div
        className={cn(
          'absolute left-0 md:left-4 top-1 w-4 h-4 rounded-full border-2',
          release.major
            ? 'bg-emerald-500 border-emerald-400'
            : 'bg-blue-500 border-blue-400'
        )}
      />

      {/* Card */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-3 px-4 py-4 md:px-6 md:py-5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
        >
          <span
            className={cn(
              'shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
              release.major
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
            )}
          >
            {release.version}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-base font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {release.title}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{release.date}</p>
          </div>
          {expanded ? (
            <ChevronDown className="size-4 text-neutral-400 shrink-0" />
          ) : (
            <ChevronRight className="size-4 text-neutral-400 shrink-0" />
          )}
        </button>

        {/* Body */}
        {expanded && (
          <div className="px-4 pb-5 md:px-6 md:pb-6 space-y-5 border-t border-neutral-100 dark:border-neutral-800 pt-4">
            {release.features && (
              <Section icon={Rocket} title="New Features" items={release.features} color="text-emerald-600 dark:text-emerald-400" />
            )}
            {release.frontendFeatures && (
              <Section icon={Monitor} title="Frontend Features" items={release.frontendFeatures} color="text-blue-600 dark:text-blue-400" />
            )}
            {release.breakingChanges && (
              <Section icon={AlertTriangle} title="Breaking Changes" items={release.breakingChanges} color="text-amber-600 dark:text-amber-400" />
            )}
            {release.infrastructure && (
              <Section icon={Wrench} title="Infrastructure" items={release.infrastructure} color="text-neutral-600 dark:text-neutral-400" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  items,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('size-4', color)} />
        <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{title}</h4>
      </div>
      <ul className="space-y-1.5 ml-6">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed list-disc">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ReleasesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-3xl mx-auto px-4 py-8 md:px-6 md:py-16">
        {/* Header */}
        <div className="mb-10 md:mb-14">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors mb-6"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Release Notes
          </h1>
          <p className="text-sm md:text-base text-neutral-500 dark:text-neutral-400 mt-2">
            A history of everything shipped in Mujarrad.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[7px] md:left-[23px] top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-700" />

          {releases.map((release, i) => (
            <ReleaseCard key={release.version} release={release} defaultOpen={i === 0} />
          ))}
        </div>
      </div>
    </div>
  );
}
