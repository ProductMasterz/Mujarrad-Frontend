import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.SYSTEM_BUILDER_MODEL || 'google/gemini-2.0-flash-001';

const SYSTEM_PROMPT = `You are an expert system architect. Given a description of a system, you produce valid draw.io XML that visualizes the architecture.

Rules:
- Return ONLY the raw draw.io XML, no markdown fences, no explanation, no surrounding text
- Use mxGraphModel format with a root element containing mxCell elements
- Assign unique numeric ids starting from 2 (ids 0 and 1 are reserved for root cells)
- Use plain text labels only — NO special characters (&, <, >, ", ') in value attributes
- Lay out nodes so they do not overlap — space them at least 150px apart
- Use appropriate styles: rounded=1 for services, shape=mxgraph.flowchart.database for databases, shape=mxgraph.flowchart.start_2 for start/end
- Connect nodes with labeled edges showing flow direction
- Keep it clean — 5 to 15 nodes maximum
- When the user asks to modify an existing diagram, return the complete updated XML (not just the changed parts)

Output format (follow exactly):
<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/>[your cells here]</root></mxGraphModel>`;

export async function POST(req: NextRequest) {
  if (!OPENROUTER_API_KEY) {
    return NextResponse.json({ error: 'OPENROUTER_API_KEY not configured' }, { status: 500 });
  }

  const { messages, currentXml } = await req.json();

  if (!messages?.length) {
    return NextResponse.json({ error: 'messages are required' }, { status: 400 });
  }

  // Build the message list: inject current XML as context before the last user message
  const apiMessages = [...messages];
  if (currentXml) {
    // Add current diagram state as a system context before last user turn
    const lastUserIndex = [...apiMessages].reverse().findIndex((m: {role:string}) => m.role === 'user');
    const insertAt = apiMessages.length - 1 - lastUserIndex;
    apiMessages.splice(insertAt, 0, {
      role: 'user',
      content: `Current diagram XML:\n${currentXml}`,
    });
    apiMessages.splice(insertAt + 1, 0, {
      role: 'assistant',
      content: 'I have the current diagram. What changes would you like?',
    });
  }

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...apiMessages,
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return NextResponse.json({ error: `LLM error: ${err}` }, { status: 502 });
  }

  const data = await response.json();
  let raw = data.choices?.[0]?.message?.content?.trim();

  if (!raw) {
    return NextResponse.json({ error: 'Empty response from LLM' }, { status: 502 });
  }

  // Strip markdown fences
  raw = raw.replace(/^```xml\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '');

  // Extract just the mxGraphModel block if surrounded by explanation text
  const match = raw.match(/<mxGraphModel[\s\S]*<\/mxGraphModel>/);
  if (match) {
    raw = match[0];
  }

  if (!raw.includes('<mxGraphModel')) {
    return NextResponse.json({ error: 'LLM did not return valid draw.io XML', raw }, { status: 502 });
  }

  // Sanitize unescaped & in attribute values
  raw = raw.replace(/&(?!amp;|lt;|gt;|quot;|apos;|#)/g, '&amp;');

  return NextResponse.json({ xml: raw });
}
