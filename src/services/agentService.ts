const AGENT_BASE_URL =
  process.env.NEXT_PUBLIC_AGENT_URL || "http://localhost:8000";

export interface AgentNode {
  id?: string;
  title?: string;
  type?: string;
}

export interface AgentRelationship {
  from?: string;
  to?: string;
  type?: string;
}

export interface AgentProcessResponse {
  nodes?: AgentNode[];
  relationships?: AgentRelationship[];
  report?: string;
}

/**
 * Generic API request helper
 */
async function agentRequest(
  endpoint: string,
  method: "GET" | "POST",
  body?: unknown
) {
  const response = await fetch(`${AGENT_BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(
      `Agent API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * CHT-004 / CHT-005
 * Send text to agent for processing
 */
export async function processText(
  text: string,
  space_slug: string
): Promise<AgentProcessResponse> {
  return agentRequest("/api/agents/process", "POST", {
    text,
    space_slug,
  });
}