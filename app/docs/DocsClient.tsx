'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Book,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Code,
  GraduationCap,
  Layers,
  Lock,
  Menu,
  Rocket,
  Search,
  Share2,
  Shield,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SwaggerEmbed } from '@/components/docs/SwaggerEmbed';
import { DocsMarkdown } from './DocsMarkdown';
import type { DocsData, DocSection } from './docs-data';

const ICONS: Record<string, LucideIcon> = {
  Rocket,
  Layers,
  Shield,
  Lock,
  GraduationCap,
  Code,
  Share2,
};

export function DocsClient({ data }: { data: DocsData }) {
  const router = useRouter();
  const { sections, groups } = data;

  const sectionBySlug = useMemo(() => {
    const map = new Map<string, DocSection>();
    sections.forEach((s) => map.set(s.slug, s));
    return map;
  }, [sections]);

  const [activeSlug, setActiveSlug] = useState<string>(sections[0]?.slug ?? '');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(() =>
    sections[0] ? [sections[0].group] : []
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeHeading, setActiveHeading] = useState<string>('');

  const searchRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const activeSection = sectionBySlug.get(activeSlug) ?? sections[0];
  const activeIndex = sections.findIndex((s) => s.slug === activeSlug);
  const prevSection = activeIndex > 0 ? sections[activeIndex - 1] : null;
  const nextSection = activeIndex >= 0 && activeIndex < sections.length - 1 ? sections[activeIndex + 1] : null;

  // --- Deep-linking: initialise from URL hash, and keep hash in sync ---------
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (hash && sectionBySlug.has(hash)) {
      setActiveSlug(hash);
      const sec = sectionBySlug.get(hash);
      if (sec) setExpandedGroups((prev) => (prev.includes(sec.group) ? prev : [...prev, sec.group]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigateTo = useCallback(
    (slug: string, group?: string) => {
      setActiveSlug(slug);
      setActiveHeading('');
      if (group) setExpandedGroups((prev) => (prev.includes(group) ? prev : [...prev, group]));
      setSidebarOpen(false);
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', `#${slug}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    []
  );

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  // --- Keyboard: focus search on "/" ----------------------------------------
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (e.key === '/' && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // --- Scroll-spy: highlight the TOC entry for the heading in view -----------
  useEffect(() => {
    if (!activeSection?.toc.length) {
      setActiveHeading('');
      return;
    }
    const root = contentRef.current;
    if (!root) return;

    const headings = Array.from(root.querySelectorAll<HTMLElement>('h2[id], h3[id]'));
    if (!headings.length) return;

    setActiveHeading(headings[0].id);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveHeading((visible[0].target as HTMLElement).id);
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0 }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [activeSection]);

  const scrollToHeading = (id: string) => {
    const el = contentRef.current?.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveHeading(id);
    }
  };

  // --- Search ---------------------------------------------------------------
  const trimmedQuery = query.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!trimmedQuery) return null;
    return sections
      .map((section) => {
        const titleMatch = section.title.toLowerCase().includes(trimmedQuery);
        const bodyMatch = section.searchText.includes(trimmedQuery);
        const headingMatches = section.toc.filter((t) => t.title.toLowerCase().includes(trimmedQuery));
        if (titleMatch || bodyMatch || headingMatches.length) {
          return { section, headingMatches };
        }
        return null;
      })
      .filter((r): r is { section: DocSection; headingMatches: DocSection['toc'] } => r !== null);
  }, [sections, trimmedQuery]);

  return (
    <div className="flex min-h-screen flex-col bg-white md:flex-row">
      {/* Mobile header */}
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-[#e5e5e5] bg-[#fafafa] px-4 py-3 md:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-md p-1 transition-colors hover:bg-[#f0f0f0]"
          aria-label="Toggle navigation"
        >
          {sidebarOpen ? <X className="size-5 text-[#4f4f4f]" /> : <Menu className="size-5 text-[#4f4f4f]" />}
        </button>
        <Book className="size-4 text-[#4f4f4f]" />
        <span className="text-[14px] font-medium text-[#333]">Documentation</span>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'z-20 w-[280px] overflow-y-auto border-r border-[#e5e5e5] bg-[#fafafa]',
          'md:sticky md:top-0 md:block md:h-screen',
          'fixed left-0 top-0 h-full transition-transform duration-200',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="border-b border-[#e5e5e5] p-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[13px] text-[#828282] transition-colors hover:text-[#4f4f4f]"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4 flex items-center gap-2">
            <Book className="size-5 text-[#4f4f4f]" />
            <span className="text-[15px] font-medium text-[#333]">Documentation</span>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#a0a0a0]" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search docs…"
              className="w-full rounded-lg border border-[#e5e5e5] bg-white py-1.5 pl-8 pr-7 text-[13px] text-[#333] outline-none transition-colors placeholder:text-[#a0a0a0] focus:border-[#333]"
            />
            {query ? (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#a0a0a0] hover:text-[#4f4f4f]"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            ) : (
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-[#e0e0e0] bg-[#f5f5f5] px-1 text-[10px] text-[#a0a0a0]">
                /
              </kbd>
            )}
          </div>

          {/* Search results OR grouped nav */}
          {searchResults ? (
            <nav className="space-y-1">
              {searchResults.length === 0 && (
                <p className="px-3 py-2 text-[13px] text-[#a0a0a0]">No results for “{query}”.</p>
              )}
              {searchResults.map(({ section, headingMatches }) => (
                <div key={section.slug}>
                  <button
                    onClick={() => navigateTo(section.slug, section.group)}
                    className={cn(
                      'w-full rounded-md px-3 py-1.5 text-left text-[13px] transition-colors',
                      activeSlug === section.slug ? 'bg-[#333] text-white' : 'text-[#4f4f4f] hover:bg-[#f0f0f0]'
                    )}
                  >
                    {section.title}
                  </button>
                  {headingMatches.slice(0, 4).map((h) => (
                    <button
                      key={h.id}
                      onClick={() => {
                        navigateTo(section.slug, section.group);
                        setTimeout(() => scrollToHeading(h.id), 60);
                      }}
                      className="block w-full truncate px-3 py-1 pl-6 text-left text-[12px] text-[#828282] hover:text-[#4f4f4f]"
                    >
                      {h.title}
                    </button>
                  ))}
                </div>
              ))}
            </nav>
          ) : (
            <nav className="space-y-1">
              {groups.map((group) => {
                const IconComponent = ICONS[group.icon] ?? Book;
                const isExpanded = expandedGroups.includes(group.id);
                const hasActive = group.sections.some((s) => s.slug === activeSlug);

                return (
                  <div key={group.id}>
                    <button
                      onClick={() => toggleGroup(group.id)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors',
                        hasActive ? 'bg-[#f0f0f0]' : 'hover:bg-[#f5f5f5]'
                      )}
                    >
                      <IconComponent className="size-4 text-[#828282]" />
                      <span className="flex-1 text-[13px] font-medium text-[#4f4f4f]">{group.title}</span>
                      {isExpanded ? (
                        <ChevronDown className="size-4 text-[#828282]" />
                      ) : (
                        <ChevronRight className="size-4 text-[#828282]" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="ml-6 mt-1 space-y-0.5">
                        {group.sections.map((item) => (
                          <button
                            key={item.slug}
                            onClick={() => navigateTo(item.slug, group.id)}
                            className={cn(
                              'w-full rounded-md px-3 py-1.5 text-left text-[13px] transition-colors',
                              activeSlug === item.slug
                                ? 'bg-[#333] text-white'
                                : 'text-[#828282] hover:bg-[#f5f5f5] hover:text-[#4f4f4f]'
                            )}
                          >
                            {item.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="min-h-screen flex-1">
        <div className="mx-auto flex max-w-[1120px] gap-10 px-4 md:px-8">
          <article ref={contentRef} className="min-w-0 max-w-[820px] flex-1 py-6 md:py-10">
            {activeSection && <DocsMarkdown content={activeSection.content} />}

            {/* Live API reference for sections that map to Swagger tags */}
            {activeSection && activeSection.swaggerTags.length > 0 && (
              <div className="mt-10 space-y-4">
                <h2 className="border-b border-[#e5e5e5] pb-2 text-xl font-semibold text-[#333]">
                  Live API Reference
                </h2>
                <p className="mb-4 text-sm text-[#828282]">
                  Interactive API endpoints fetched from the live Swagger documentation.
                </p>
                {activeSection.swaggerTags.map((swagger) => (
                  <SwaggerEmbed key={swagger.tag} tag={swagger.tag} title={swagger.title} className="mb-4" />
                ))}
              </div>
            )}

            {/* Prev / Next */}
            <div className="mt-12 flex items-stretch justify-between gap-4 border-t border-[#e5e5e5] pt-6">
              {prevSection ? (
                <button
                  onClick={() => navigateTo(prevSection.slug, prevSection.group)}
                  className="group flex flex-1 items-center gap-2 rounded-lg border border-[#e5e5e5] p-3 text-left transition-colors hover:border-[#333]"
                >
                  <ChevronLeft className="size-4 shrink-0 text-[#828282]" />
                  <span className="min-w-0">
                    <span className="block text-[11px] uppercase tracking-wide text-[#a0a0a0]">Previous</span>
                    <span className="block truncate text-[14px] font-medium text-[#333]">{prevSection.title}</span>
                  </span>
                </button>
              ) : (
                <span className="flex-1" />
              )}
              {nextSection ? (
                <button
                  onClick={() => navigateTo(nextSection.slug, nextSection.group)}
                  className="group flex flex-1 items-center justify-end gap-2 rounded-lg border border-[#e5e5e5] p-3 text-right transition-colors hover:border-[#333]"
                >
                  <span className="min-w-0">
                    <span className="block text-[11px] uppercase tracking-wide text-[#a0a0a0]">Next</span>
                    <span className="block truncate text-[14px] font-medium text-[#333]">{nextSection.title}</span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-[#828282]" />
                </button>
              ) : (
                <span className="flex-1" />
              )}
            </div>
          </article>

          {/* On-this-page TOC */}
          {activeSection && activeSection.toc.length > 0 && (
            <aside className="hidden w-[220px] shrink-0 xl:block">
              <div className="sticky top-0 max-h-screen overflow-y-auto py-10">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-[#a0a0a0]">On this page</p>
                <ul className="space-y-1 border-l border-[#e5e5e5]">
                  {activeSection.toc.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => scrollToHeading(item.id)}
                        className={cn(
                          '-ml-px block w-full border-l-2 py-1 text-left text-[12px] leading-5 transition-colors',
                          item.level === 3 ? 'pl-6' : 'pl-3',
                          activeHeading === item.id
                            ? 'border-[#333] font-medium text-[#333]'
                            : 'border-transparent text-[#828282] hover:text-[#4f4f4f]'
                        )}
                      >
                        {item.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
