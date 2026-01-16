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

  // Mock data - replace with actual data from your app
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
        // Apply type filter
        if (searchIn !== "all" && result.type !== searchIn) {
          return false;
        }

        // Apply title-only filter
        if (titleOnly) {
          return result.title.toLowerCase().includes(searchQuery.toLowerCase());
        }

        // Search in all fields
        const searchLower = searchQuery.toLowerCase();
        return (
          result.title.toLowerCase().includes(searchLower) ||
          result.path?.toLowerCase().includes(searchLower) ||
          result.description?.toLowerCase().includes(searchLower)
        );
      })
    : [];

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
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
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Close dropdown when clicking outside
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
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="shrink-0"
          >
            <path
              d="M5.19999 9.19999V6.4"
              stroke="#828282"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5.20001 5.20001C5.75229 5.20001 6.20001 4.75229 6.20001 4.20001C6.20001 3.64772 5.75229 3.20001 5.20001 3.20001C4.64772 3.20001 4.20001 3.64772 4.20001 4.20001C4.20001 4.75229 4.64772 5.20001 5.20001 5.20001Z"
              stroke="#828282"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2.8 12.8C3.35228 12.8 3.8 12.3523 3.8 11.8C3.8 11.2477 3.35228 10.8 2.8 10.8C2.24772 10.8 1.8 11.2477 1.8 11.8C1.8 12.3523 2.24772 12.8 2.8 12.8Z"
              stroke="#828282"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7.6 12.8C8.15228 12.8 8.6 12.3523 8.6 11.8C8.6 11.2477 8.15228 10.8 7.6 10.8C7.04772 10.8 6.6 11.2477 6.6 11.8C6.6 12.3523 7.04772 12.8 7.6 12.8Z"
              stroke="#828282"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 5.20001C10.5523 5.20001 11 4.75229 11 4.20001C11 3.64772 10.5523 3.20001 10 3.20001C9.44772 3.20001 9 3.64772 9 4.20001C9 4.75229 9.44772 5.20001 10 5.20001Z"
              stroke="#828282"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "node":
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="shrink-0"
          >
            <path
              d="M6.66667 4.66667L5.33333 6L6.66667 7.33333M9.33333 4.66667L10.6667 6L9.33333 7.33333M14.6667 8C14.6667 11.6819 11.6819 14.6667 8 14.6667C4.3181 14.6667 1.33333 11.6819 1.33333 8C1.33333 4.3181 4.3181 1.33333 8 1.33333C11.6819 1.33333 14.6667 4.3181 14.6667 8Z"
              stroke="#828282"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "space":
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="shrink-0"
          >
            <path
              d="M5.20001 5.20001C5.75229 5.20001 6.20001 4.75229 6.20001 4.20001C6.20001 3.64772 5.75229 3.20001 5.20001 3.20001C4.64772 3.20001 4.20001 3.64772 4.20001 4.20001C4.20001 4.75229 4.64772 5.20001 5.20001 5.20001Z"
              stroke="#4F4F4F"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2.8 12.8C3.35228 12.8 3.8 12.3523 3.8 11.8C3.8 11.2477 3.35228 10.8 2.8 10.8C2.24772 10.8 1.8 11.2477 1.8 11.8C1.8 12.3523 2.24772 12.8 2.8 12.8Z"
              stroke="#4F4F4F"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7.6 12.8C8.15228 12.8 8.6 12.3523 8.6 11.8C8.6 11.2477 8.15228 10.8 7.6 10.8C7.04772 10.8 6.6 11.2477 6.6 11.8C6.6 12.3523 7.04772 12.8 7.6 12.8Z"
              stroke="#4F4F4F"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 5.20001C10.5523 5.20001 11 4.75229 11 4.20001C11 3.64772 10.5523 3.20001 10 3.20001C9.44772 3.20001 9 3.64772 9 4.20001C9 4.75229 9.44772 5.20001 10 5.20001Z"
              stroke="#4F4F4F"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
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
        <span className="text-[#333] font-semibold">
          {text.slice(index, index + query.length)}
        </span>
        {text.slice(index + query.length)}
      </>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/20 z-[200] flex items-start justify-center pt-[120px]">
      <div
        ref={modalRef}
        className="bg-white rounded-[12px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08),0px_0px_48px_0px_rgba(0,0,0,0.04)] w-[580px] max-h-[600px] flex flex-col"
      >
        {/* Search Header */}
        <div className="px-[26px] py-[16px] border-b border-[#f2f2f2]">
          <div className="flex items-center gap-[8px]">
            <Search className="size-[24px] text-[#828282] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Search for content, node, comests"
              className="flex-1 font-['Roboto:Regular',sans-serif] font-normal text-[15px] text-[#333] tracking-[-0.24px] leading-[24px] outline-none"
              style={{ fontVariationSettings: "'wdth' 100" }}
            />

            {/* Filter controls - shown when filters are active */}
            {showFilters && (
              <div className="flex items-center gap-[8px]">
                {/* Title only button */}
                <button
                  onClick={() => setTitleOnly(!titleOnly)}
                  className={`h-[32px] px-[12px] rounded-[100px] border transition-colors font-['Roboto:Regular',sans-serif] font-normal text-[15px] tracking-[-0.24px] ${
                    titleOnly
                      ? "border-[#248bf2] text-[#248bf2] bg-white"
                      : "border-[#f2f2f2] text-[#828282] bg-white hover:border-[#e0e0e0]"
                  }`}
                  style={{ fontVariationSettings: "'wdth' 100" }}
                >
                  Title only
                </button>

                {/* Search in dropdown */}
                <div className="relative" ref={searchInDropdownRef}>
                  <button
                    onClick={() => setShowSearchInDropdown(!showSearchInDropdown)}
                    className="h-[32px] px-[12px] rounded-[100px] border border-[#f2f2f2] bg-white hover:border-[#e0e0e0] transition-colors flex items-center gap-[8px] font-['Roboto:Regular',sans-serif] font-normal text-[15px] text-[#828282] tracking-[-0.24px]"
                    style={{ fontVariationSettings: "'wdth' 100" }}
                  >
                    <span>
                      Search in:{" "}
                      <span className="capitalize">
                        {searchIn === "all" ? "All" : searchIn}
                      </span>
                    </span>
                    <ChevronDown className="size-[12px] rotate-[270deg]" />
                  </button>

                  {/* Dropdown menu */}
                  {showSearchInDropdown && (
                    <div className="absolute top-[calc(100%+4px)] right-0 bg-white rounded-[8px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] py-[4px] min-w-[120px] z-10">
                      {(["all", "space", "context", "node"] as FilterType[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setSearchIn(type);
                            setShowSearchInDropdown(false);
                          }}
                          className="w-full px-[16px] py-[8px] text-left font-['Roboto:Regular',sans-serif] font-normal text-[15px] text-[#333] hover:bg-[#f5f5f5] transition-colors capitalize tracking-[-0.24px]"
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
              className={`size-[24px] flex items-center justify-center transition-colors ${
                showFilters ? "text-[#248bf2]" : "text-[#828282] hover:text-[#333]"
              }`}
            >
              <Filter className="size-[24px]" />
            </button>
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto px-[26px] py-[16px] min-h-[200px]">
          {searchQuery === "" ? (
            <div className="flex items-center justify-center h-full text-[#bdbdbd] font-['Roboto:Regular',sans-serif] font-normal text-[13px]">
              Start typing to search...
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="flex flex-col gap-[16px]">
              <div className="text-[#bdbdbd] font-['Roboto:Regular',sans-serif] font-normal text-[13px]">
                No results found
              </div>
              <button className="flex items-center gap-[8px] text-[#248bf2] font-['Roboto:Regular',sans-serif] font-normal text-[13px] hover:text-[#1a6bc4] transition-colors">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle
                    cx="8"
                    cy="8"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M8 5V11M5 8H11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
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
                  className={`flex items-start gap-[8px] px-[12px] py-[10px] rounded-[8px] text-left transition-colors ${
                    selectedIndex === index
                      ? "bg-[#f5f5f5]"
                      : "hover:bg-[#f5f5f5]"
                  }`}
                >
                  <div className="mt-[4px]">{getIconForType(result.type)}</div>
                  <div className="flex-1 flex flex-col gap-[4px]">
                    <div
                      className="font-['Roboto:SemiBold',sans-serif] font-semibold text-[15px] text-[#333] tracking-[-0.08px] leading-[20px]"
                      style={{ fontVariationSettings: "'wdth' 100" }}
                    >
                      {highlightMatch(result.title, searchQuery)}
                    </div>
                    {result.path && (
                      <div
                        className="font-['Roboto:Regular',sans-serif] font-normal text-[12px] text-[#828282] tracking-[-0.08px] leading-[18px]"
                        style={{ fontVariationSettings: "'wdth' 100" }}
                      >
                        {result.path}
                      </div>
                    )}
                    {result.description && (
                      <div
                        className="font-['Roboto:Regular',sans-serif] font-normal text-[12px] text-[#828282] tracking-[-0.08px] leading-[18px] line-clamp-2"
                        style={{ fontVariationSettings: "'wdth' 100" }}
                      >
                        The{" "}
                        <span className="text-[#333] font-semibold">
                          {highlightMatch("journey", searchQuery)}
                        </span>{" "}
                        {result.description}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-[4px] items-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M4.66667 6L8 9.33333L11.3333 6"
                        stroke="#E0E0E0"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle
                        cx="8"
                        cy="8"
                        r="1"
                        fill="#E0E0E0"
                      />
                    </svg>
                  </div>
                </button>
              ))}

              {/* Add new option */}
              {searchQuery && (
                <button className="flex items-center gap-[8px] px-[12px] py-[10px] text-[#248bf2] font-['Roboto:Regular',sans-serif] font-normal text-[13px] hover:bg-[#f5f5f5] rounded-[8px] transition-colors">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle
                      cx="8"
                      cy="8"
                      r="7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M8 5V11M5 8H11"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>Add a new information with title &quot;{searchQuery}&quot;</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Keyboard Shortcuts */}
        <div className="px-[26px] py-[12px] border-t border-[#f2f2f2] flex items-center gap-[16px] flex-wrap">
          <div className="flex items-center gap-[4px]">
            <div className="bg-[#d9d9d9] rounded-[6px] px-[8px] py-[4px] font-['Roboto:SemiBold',sans-serif] font-semibold text-[8px] text-[#828282] tracking-[-0.24px] leading-[12px]">
              Tab
            </div>
            <span
              className="font-['Roboto:Regular',sans-serif] font-normal text-[12px] text-[#828282] tracking-[-0.24px] leading-[18px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              to open as a node
            </span>
          </div>
          <div className="flex items-center gap-[4px]">
            <div className="bg-[#d9d9d9] rounded-[6px] px-[8px] py-[4px] font-['Roboto:SemiBold',sans-serif] font-semibold text-[8px] text-[#828282] tracking-[-0.24px] leading-[12px]">
              ⌘⇧
            </div>
            <span
              className="font-['Roboto:Regular',sans-serif] font-normal text-[12px] text-[#828282] tracking-[-0.24px] leading-[18px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              to open as its type
            </span>
          </div>
          <div className="flex items-center gap-[4px]">
            <div className="bg-[#d9d9d9] rounded-[6px] px-[8px] py-[4px] font-['Roboto:SemiBold',sans-serif] font-semibold text-[8px] text-[#828282] tracking-[-0.24px] leading-[12px]">
              △
            </div>
            <span
              className="font-['Roboto:Regular',sans-serif] font-normal text-[12px] text-[#828282] tracking-[-0.24px] leading-[18px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              to navigate
            </span>
          </div>
          <div className="flex items-center gap-[4px]">
            <div className="bg-[#d9d9d9] rounded-[6px] px-[8px] py-[4px] font-['Roboto:SemiBold',sans-serif] font-semibold text-[8px] text-[#828282] tracking-[-0.24px] leading-[12px]">
              ⎋
            </div>
            <span
              className="font-['Roboto:Regular',sans-serif] font-normal text-[12px] text-[#828282] tracking-[-0.24px] leading-[18px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
