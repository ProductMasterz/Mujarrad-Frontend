import type { AgentProcessResponse } from '@/types/backend-dtos';

export interface AgentProcessRequest {
  text: string;
  space_slug: string;
  message_id: string;
  conversation_node_id: string;
  conversation_title: string;
  assistant_node_id: string;
}

const agentServiceUrl = process.env.NEXT_PUBLIC_AGENT_SERVICE_URL;
const agentApiKey = process.env.NEXT_PUBLIC_AGENT_API_KEY;

export const agentService = {
  async process(request: AgentProcessRequest, token?: string | null): Promise<AgentProcessResponse> {
    if (!agentServiceUrl) {
      throw new Error('Agent service is not available yet. Squad B backend is not connected.');
    }

    const response = await fetch(`${agentServiceUrl}/api/agents/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(agentApiKey ? { 'X-API-Key': agentApiKey } : {}),
      },
      body: JSON.stringify(request),
    });

    let data: AgentProcessResponse | null = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok || data?.error) {
      const errorMessage = data?.message || `Agent service returned ${response.status}`;
      throw new Error(errorMessage);
    }

    return data ?? {};
  },
};
