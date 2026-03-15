"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Filter, ChevronDown } from "lucide-react";

type SearchResult = {
  id: string;
  type: "context" | "node" | "space";
  title: string;
  path?: string;
  description?: string;
};

type SearchModalProps = {
  onClose: () => void;
  onNavigate?: (id: string, type: string) => void;
};

type FilterType = "all" | "space" | "context" | "node";

export function SearchModal({ onClose, onNavigate }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [titleOnly, setTitleOnly] = useState(false);
  const [searchIn, setSearchIn] = useState<FilterType>("all");
  const [showSearchInDropdown, setShowSearchInDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInDropdownRef = useRef<HTMLDivElement>(null);

  const allResults: SearchResult[] = [
    {
      id: "journeys-1",
      type: "context",
      title: "Journeys",
      path: "Scratch Up space / User story map/ Journeys",
    },
    {
      id: "journey-def",
      type: "node",
      title: "Journey definition on User story map",
      path: "Scratch Up space / User story map / definition f...",
    },
    {
      id: "untitled-1",
      type: "node",
      title: "Untitled",
      path: "Void / Untitled",
      description: "The journey definition is lorem ipsum lorem from the KO definition website...",
    },
    {
      id: "node-name",
      type: "node",
      title: "Node name",
      path: "Altimira / User story map / node-name",
      description: "The journey definition is lorem ipsum lorem from the KO definition website...",
    },
    {
      id: "joun-space",
      type: "space",
      title: "Joun Doe space",
    },
  ];

  const filteredResults = searchQuery
    ? allResults.filter((result) => {
        if (searchIn !== "all" && result.type !== searchIn) return false;

        if (titleOnly) {
          return result.title.toLowerCase().includes(searchQuery.toLowerCase());
        }

        const searchLower = searchQuery.toLowerCase();
        return (
          result.title.toLowerCase().includes(searchLower) ||
          result.path?.toLowerCase().includes(searchLower) ||
          result.description?.toLowerCase().includes(searchLower)
        );
      })
    : [];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredResults.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredResults[selectedIndex]) {
            const result = filteredResults[selectedIndex];
            onNavigate?.(result.id, result.type);
            onClose();
          }
          break;
        case "Tab":
          e.preventDefault();
          if (filteredResults[selectedIndex]) {
            const result = filteredResults[selectedIndex];
            onNavigate?.(result.id, "node");
            onClose();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [filteredResults, selectedIndex, onClose, onNavigate]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchInDropdownRef.current &&
        !searchInDropdownRef.current.contains(e.target as Node)
      ) {
        setShowSearchInDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIconForType = (type: string) => {
    switch (type) {
      case "context":
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <path d="M5.19999 9.19999V6.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5.20001 5.20001C5.75229 5.20001 6.20001 4.75229 6.20001 4.20001C6.20001 3.64772 5.75229 3.20001 5.20001 3.20001C4.64772 3.20001 4.20001 3.64772 4.20001 4.20001C4.20001 4.75229 4.64772 5.20001 5.20001 5.20001Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2.8 12.8C3.35228 12.8 3.8 12.3523 3.8 11.8C3.8 11.2477 3.35228 10.8 2.8 10.8C2.24772 10.8 1.8 11.2477 1.8 11.8C1.8 12.3523 2.24772 12.8 2.8 12.8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7.6 12.8C8.15228 12.8 8.6 12.3523 8.6 11.8C8.6 11.2477 8.15228 10.8 7.6 10.8C7.04772 10.8 6.6 11.2477 6.6 11.8C6.6 12.3523 7.04772 12.8 7.6 12.8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 5.20001C10.5523 5.20001 11 4.75229 11 4.20001C11 3.64772 10.5523 3.20001 10 3.20001C9.44772 3.20001 9 3.64772 9 4.20001C9 4.75229 9.44772 5.20001 10 5.20001Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "node":
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <path
              d="M6.66667 4.66667L5.33333 6L6.66667 7.33333M9.33333 4.66667L10.6667 6L9.33333 7.33333M14.6667 8C14.6667 11.6819 11.6819 14.6667 8 14.6667C4.3181 14.6667 1.33333 11.6819 1.33333 8C1.33333 4.3181 4.3181 1.33333 8 1.33333C11.6819 1.33333 14.6667 4.3181 14.6667 8Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "space":
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <path d="M5.20001 5.20001C5.75229 5.20001 6.20001 4.75229 6.20001 4.20001C6.20001 3.64772 5.75229 3.20001 5.20001 3.20001C4.64772 3.20001 4.20001 3.64772 4.20001 4.20001C4.20001 4.75229 4.64772 5.20001 5.20001 5.20001Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2.8 12.8C3.35228 12.8 3.8 12.3523 3.8 11.8C3.8 11.2477 3.35228 10.8 2.8 10.8C2.24772 10.8 1.8 11.2477 1.8 11.8C1.8 12.3523 2.24772 12.8 2.8 12.8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7.6 12.8C8.15228 12.8 8.6 12.3523 8.6 11.8C8.6 11.2477 8.15228 10.8 7.6 10.8C7.04772 10.8 6.6 11.2477 6.6 11.8C6.6 12.3523 7.04772 12.8 7.6 12.8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 5.20001C10.5523 5.20001 11 4.75229 11 4.20001C11 3.64772 10.5523 3.20001 10 3.20001C9.44772 3.20001 9 3.64772 9 4.20001C9 4.75229 9.44772 5.20001 10 5.20001Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      default:
        return null;
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;

    return (
      <>
        {text.slice(0, index)}
        <span className="font-semibold text-foreground">
          {text.slice(index, index + query.length)}
        </span>
        {text.slice(index + query.length)}
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/30 pt-[120px]">
      <div
        ref={modalRef}
        className="flex max-h-[600px] w-[580px] flex-col rounded-[12px] border border-border bg-background text-foreground shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08),0px_0px_48px_0px_rgba(0,0,0,0.04)] dark:shadow-[0px_14px_34px_rgba(0,0,0,0.35)]"
      >
        <div className="border-b border-border px-[26px] py-[16px]">
          <div className="flex items-center gap-[8px]">
            <Search className="size-[24px] shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Search for content, node, contexts"
              className="flex-1 bg-transparent font-['Roboto:Regular',sans-serif] text-[15px] font-normal leading-[24px] tracking-[-0.24px] text-foreground outline-none placeholder:text-muted-foreground"
              style={{ fontVariationSettings: "'wdth' 100" }}
            />

            {showFilters && (
              <div className="flex items-center gap-[8px]">
                <button
                  onClick={() => setTitleOnly(!titleOnly)}
                  className={`h-[32px] rounded-[100px] border px-[12px] font-['Roboto:Regular',sans-serif] text-[15px] font-normal tracking-[-0.24px] transition-colors ${
                    titleOnly
                      ? "border-primary bg-background text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-border"
                  }`}
                  style={{ fontVariationSettings: "'wdth' 100" }}
                >
                  Title only
                </button>

                <div className="relative" ref={searchInDropdownRef}>
                  <button
                    onClick={() => setShowSearchInDropdown(!showSearchInDropdown)}
                    className="flex h-[32px] items-center gap-[8px] rounded-[100px] border border-border bg-background px-[12px] font-['Roboto:Regular',sans-serif] text-[15px] font-normal tracking-[-0.24px] text-muted-foreground transition-colors hover:border-border"
                    style={{ fontVariationSettings: "'wdth' 100" }}
                  >
                    <span>
                      Search in: <span className="capitalize">{searchIn === "all" ? "All" : searchIn}</span>
                    </span>
                    <ChevronDown className="size-[12px]" />
                  </button>

                  {showSearchInDropdown && (
                    <div className="absolute right-0 top-[calc(100%+4px)] z-10 min-w-[120px] rounded-[8px] border border-border bg-background py-[4px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] dark:shadow-[0px_10px_24px_rgba(0,0,0,0.35)]">
                      {(["all", "space", "context", "node"] as FilterType[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setSearchIn(type);
                            setShowSearchInDropdown(false);
                          }}
                          className="w-full px-[16px] py-[8px] text-left font-['Roboto:Regular',sans-serif] text-[15px] font-normal capitalize tracking-[-0.24px] text-foreground transition-colors hover:bg-accent"
                          style={{ fontVariationSettings: "'wdth' 100" }}
                        >
                          {type === "all" ? "All" : type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex size-[24px] items-center justify-center transition-colors ${
                showFilters ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Filter className="size-[24px]" />
            </button>
          </div>
        </div>

        <div className="min-h-[200px] flex-1 overflow-y-auto px-[26px] py-[16px]">
          {searchQuery === "" ? (
            <div className="flex h-full items-center justify-center font-['Roboto:Regular',sans-serif] text-[13px] font-normal text-muted-foreground/70">
              Start typing to search...
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="flex flex-col gap-[16px]">
              <div className="font-['Roboto:Regular',sans-serif] text-[13px] font-normal text-muted-foreground/70">
                No results found
              </div>
              <button className="flex items-center gap-[8px] rounded-[8px] text-[13px] text-primary transition-colors hover:text-primary/80">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 5V11M5 8H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span>Add a new information with title &quot;{searchQuery}&quot;</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-[12px]">
              {filteredResults.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => {
                    onNavigate?.(result.id, result.type);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-start gap-[8px] rounded-[8px] px-[12px] py-[10px] text-left transition-colors ${
                    selectedIndex === index ? "bg-accent" : "hover:bg-accent"
                  }`}
                >
                  <div className="mt-[4px] text-muted-foreground">{getIconForType(result.type)}</div>

                  <div className="flex flex-1 flex-col gap-[4px]">
                    <div
                      className="font-['Roboto:SemiBold',sans-serif] text-[15px] font-semibold leading-[20px] tracking-[-0.08px] text-foreground"
                      style={{ fontVariationSettings: "'wdth' 100" }}
                    >
                      {highlightMatch(result.title, searchQuery)}
                    </div>

                    {result.path && (
                      <div
                        className="font-['Roboto:Regular',sans-serif] text-[12px] font-normal leading-[18px] tracking-[-0.08px] text-muted-foreground"
                        style={{ fontVariationSettings: "'wdth' 100" }}
                      >
                        {result.path}
                      </div>
                    )}

                    {result.description && (
                      <div
                        className="line-clamp-2 font-['Roboto:Regular',sans-serif] text-[12px] font-normal leading-[18px] tracking-[-0.08px] text-muted-foreground"
                        style={{ fontVariationSettings: "'wdth' 100" }}
                      >
                        The <span className="font-semibold text-foreground">{highlightMatch("journey", searchQuery)}</span>{" "}
                        {result.description}
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-[4px] text-border">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4.66667 6L8 9.33333L11.3333 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="1" fill="currentColor" />
                    </svg>
                  </div>
                </button>
              ))}

              {searchQuery && (
                <button className="flex items-center gap-[8px] rounded-[8px] px-[12px] py-[10px] font-['Roboto:Regular',sans-serif] text-[13px] font-normal text-primary transition-colors hover:bg-accent">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 5V11M5 8H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span>Add a new information with title &quot;{searchQuery}&quot;</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-[16px] border-t border-border px-[26px] py-[12px]">
          {[
            ["Tab", "to open as a node"],
            ["⌘⇧", "to open as its type"],
            ["△", "to navigate"],
            ["⎋", "to close"],
          ].map(([key, text]) => (
            <div key={key} className="flex items-center gap-[4px]">
              <div className="rounded-[6px] bg-muted px-[8px] py-[4px] font-['Roboto:SemiBold',sans-serif] text-[8px] font-semibold leading-[12px] tracking-[-0.24px] text-muted-foreground">
                {key}
              </div>
              <span
                className="font-['Roboto:Regular',sans-serif] text-[12px] font-normal leading-[18px] tracking-[-0.24px] text-muted-foreground"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}