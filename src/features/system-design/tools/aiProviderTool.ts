import { createIsoTimestamp, createSystemDesignId } from '../utils/id';

export interface AiRequestOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json_object';
}

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callAiProvider(
  messages: AiMessage[],
  options?: AiRequestOptions,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn('OPENAI_API_KEY is missing. Using mock AI response.');
    return generateMockResponse(messages, options);
  }

  const model = options?.model ?? 'gpt-4o-mini';
  const responseFormat = options?.responseFormat === 'json_object' ? { type: 'json_object' } : undefined;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1000,
      response_format: responseFormat,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('AI provider error:', errorBody);
    throw new Error(`AI provider request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function generateMockResponse(messages: AiMessage[], options?: AiRequestOptions): string {
  // Simple mock logic depending on if JSON is requested
  const isJson = options?.responseFormat === 'json_object';
  
  if (isJson) {
    const isQuestion = messages.some(m => m.content.includes('Generate exactly one question'));
    const isUnderstanding = messages.some(m => m.content.includes('Update the system understanding'));
    const isCompleteness = messages.some(m => m.content.includes('Evaluate the completeness'));

    if (isQuestion) {
      return JSON.stringify({
        question: "Can you elaborate on the main goal of the system?",
        category: "goal",
        reasonForAsking: "We need a clear understanding of the primary objective.",
        expectedAnswerType: "long_text"
      });
    }

    if (isUnderstanding) {
      return JSON.stringify({
        summary: "Mock system summary",
        goal: "Mock goal",
        primaryUsers: ["Admin"],
        secondaryUsers: [],
        roles: ["Admin"],
        permissions: ["All"],
        workflows: [],
        alternativeWorkflows: [],
        inputs: [],
        outputs: [],
        entities: [],
        businessRules: [],
        decisionLogic: [],
        validationRules: [],
        edgeCases: [],
        errorCases: [],
        integrations: [],
        notifications: [],
        reporting: [],
        security: [],
        openQuestions: [],
        assumptions: [],
        confidence: 0.5
      });
    }

    if (isCompleteness) {
      return JSON.stringify({
        overallScore: 50,
        readyForSpec: false,
        readyForDiagram: false,
        categories: [
          { category: 'goal', status: 'weak', score: 50, notes: 'Needs more detail.' }
        ],
        missingCriticalItems: ['Core workflow steps'],
        weakItems: ['User roles'],
        suggestedNextQuestionCategory: 'workflow'
      });
    }
    
    return "{}";
  }

  return "This is a mock AI response.";
}
