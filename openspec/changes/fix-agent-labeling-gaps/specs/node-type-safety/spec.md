# Node Type Safety

Complete the `NodeDetails` interface and agent-related type definitions to eliminate untyped field access across the codebase.

## ADDED Requirements

### Requirement: NodeDetails Interface Completion

The `NodeDetails` interface in `src/types/backend-dtos.ts` MUST include all fields that are actively used across the codebase, with correct union types.

**Fields to add:**
- `createdFrom?: 'manual' | 'chat' | 'agent' | 'wiki-link' | 'assistant-ui' | string`
- `generatedBy?: 'agent' | 'manual' | string`
- `source?: string`
- `chatNodeType?: 'conversation' | 'message' | 'entity' | string`
- `role?: 'user' | 'assistant' | 'conversation' | string`
- `isPlaceholder?: boolean`
- `sessionType?: string`
- `scope?: string`
- `status?: 'pending' | 'completed' | string`

#### Scenario: Agent-created node details are typed
Given a node created by the agent with `createdFrom: 'agent'` and `semanticTypeSource: 'agent'`
When the node is accessed in any component
Then TypeScript recognizes these fields without `as Record<string, unknown>` casts

#### Scenario: Chat message node details are typed
Given a chat message node with `chatNodeType: 'message'` and `role: 'assistant'`
When ChatPanel.tsx accesses these fields
Then no type assertion is needed and autocomplete works

#### Scenario: Wiki-link placeholder node details are typed
Given a placeholder node created by wikilink.service with `isPlaceholder: true` and `createdFrom: 'wiki-link'`
When the node is processed
Then the fields are recognized by the TypeScript compiler

### Requirement: Agent Response Types in DTOs

Agent-related types (`AgentProcessNode`, `AgentProcessRelationship`, `AgentProcessResponse`, `ChatMessage`, `ChatSession`) MUST be defined as exported interfaces in `src/types/backend-dtos.ts` instead of local types in ChatPanel.tsx.

#### Scenario: AgentProcessResponse is importable
Given a component or service that needs to process agent responses
When it imports `AgentProcessResponse` from `@/types/backend-dtos`
Then the type is available with all fields typed (nodes, relationships, report, message, error, etc.)

#### Scenario: AgentProcessNode has semantic fields
Given an agent-created node in the response
When `AgentProcessNode` is used to type it
Then it includes `title`, `nodeType`, `semanticType`, `entityType`, `content` as optional typed fields beyond `Record<string, unknown>`

#### Scenario: ChatPanel uses DTO types
Given the ChatPanel component
When it references agent response types
Then it imports from `@/types/backend-dtos` instead of defining local types
