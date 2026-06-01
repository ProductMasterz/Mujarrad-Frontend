'use client';

import { useEffect, useRef, useState } from 'react';
import { ExternalLink, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwaggerEmbedProps {
  tag: string;
  title: string;
  className?: string;
}

interface Endpoint {
  method: string;
  path: string;
  summary: string;
  description?: string;
  operationId?: string;
}

const METHOD_COLORS: Record<string, { bg: string; text: string }> = {
  get: { bg: 'bg-blue-100', text: 'text-blue-700' },
  post: { bg: 'bg-green-100', text: 'text-green-700' },
  put: { bg: 'bg-orange-100', text: 'text-orange-700' },
  patch: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  delete: { bg: 'bg-red-100', text: 'text-red-700' },
};

export function SwaggerEmbed({ tag, title, className }: SwaggerEmbedProps) {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchSwaggerSpec() {
      try {
        setLoading(true);
        const response = await fetch('https://mujarrad.onrender.com/v3/api-docs');
        if (!response.ok) throw new Error('Failed to fetch API spec');

        const spec = await response.json();
        const filteredEndpoints: Endpoint[] = [];

        // Extract endpoints matching the tag
        for (const [path, methods] of Object.entries(spec.paths || {})) {
          for (const [method, details] of Object.entries(methods as Record<string, any>)) {
            if (details.tags?.some((t: string) => t.toLowerCase().includes(tag.toLowerCase()))) {
              filteredEndpoints.push({
                method: method.toUpperCase(),
                path,
                summary: details.summary || '',
                description: details.description || '',
                operationId: details.operationId,
              });
            }
          }
        }

        setEndpoints(filteredEndpoints);
        setError(null);
      } catch (err) {
        setError('Failed to load API endpoints');
        console.error('Swagger fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSwaggerSpec();
  }, [tag]);

  const toggleEndpoint = (operationId: string) => {
    setExpandedEndpoints((prev) => {
      const next = new Set(prev);
      if (next.has(operationId)) {
        next.delete(operationId);
      } else {
        next.add(operationId);
      }
      return next;
    });
  };

  const specUrl = `https://mujarrad.onrender.com/v3/api-docs`;

  if (loading) {
    return (
      <div className={cn("border border-[#e5e5e5] rounded-lg p-4 bg-[#fafafa]", className)}>
        <div className="flex items-center gap-2 text-[#828282]">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-sm">Loading API endpoints...</span>
        </div>
      </div>
    );
  }

  if (error || endpoints.length === 0) {
    return (
      <div className={cn("border border-[#e5e5e5] rounded-lg p-4 bg-[#fafafa]", className)}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#828282]">
            {error || 'No endpoints found for this section'}
          </span>
          <a
            href={specUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            View in Swagger <ExternalLink className="size-3" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("border border-[#e5e5e5] rounded-lg overflow-hidden bg-white", className)}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-[#fafafa] hover:bg-[#f5f5f5] transition-colors border-b border-[#e5e5e5]"
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="size-4 text-[#828282]" />
          ) : (
            <ChevronRight className="size-4 text-[#828282]" />
          )}
          <span className="font-medium text-[14px] text-[#333]">
            {title} API Endpoints
          </span>
          <span className="text-xs bg-[#333] text-white px-2 py-0.5 rounded-full">
            {endpoints.length}
          </span>
        </div>
        <a
          href={specUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          Open Swagger <ExternalLink className="size-3" />
        </a>
      </button>

      {/* Endpoints List */}
      {expanded && (
        <div className="divide-y divide-[#e5e5e5]">
          {endpoints.map((endpoint, idx) => {
            const methodStyle = METHOD_COLORS[endpoint.method.toLowerCase()] || METHOD_COLORS.get;
            const isExpanded = expandedEndpoints.has(endpoint.operationId || `${idx}`);

            return (
              <div key={endpoint.operationId || idx} className="bg-white">
                <button
                  onClick={() => toggleEndpoint(endpoint.operationId || `${idx}`)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-[#fafafa] transition-colors text-left"
                >
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-xs font-mono font-semibold uppercase min-w-[60px] text-center",
                      methodStyle.bg,
                      methodStyle.text
                    )}
                  >
                    {endpoint.method}
                  </span>
                  <code className="text-sm font-mono text-[#4f4f4f] flex-1">
                    {endpoint.path}
                  </code>
                  {endpoint.summary && (
                    <span className="text-sm text-[#828282] hidden md:block max-w-[300px] truncate">
                      {endpoint.summary}
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="size-4 text-[#828282]" />
                  ) : (
                    <ChevronRight className="size-4 text-[#828282]" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-3 pt-1 bg-[#fafafa] border-t border-[#f0f0f0]">
                    {endpoint.summary && (
                      <p className="text-sm font-medium text-[#333] mb-1">
                        {endpoint.summary}
                      </p>
                    )}
                    {endpoint.description && (
                      <p className="text-sm text-[#828282]">
                        {endpoint.description}
                      </p>
                    )}
                    <a
                      href={`https://mujarrad.onrender.com/v3/api-docs#/${encodeURIComponent(tag)}/${endpoint.operationId || ''}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-2"
                    >
                      Try it in Swagger <ExternalLink className="size-3" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
