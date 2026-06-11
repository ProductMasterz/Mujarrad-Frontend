# Agent Pipeline

Implement the missing agent node/relationship creation from AgentProcessResponse and establish a dedicated agent service.

## ADDED Requirements

### Requirement: Create Nodes from Agent Response

After receiving `AgentProcessResponse`, the frontend MUST iterate `response.nodes[]` and create each as a real database entity via `nodeService.createNode()`. Each created node MUST have:
- `nodeDetails.createdFrom = 'agent'`
- `nodeDetails.generatedBy = 'agent'`
- `nodeDetails.semanticTypeSource = 'agent'`
- `nodeDetails.semanticType` set from the agent's classification
- `nodeDetails.entityType` set from the agent's classification

#### Scenario: Agent returns 3 entity nodes
Given the agent processes user text and returns 3 nodes (person, place, topic)
When the response is processed
Then 3 nodes are created in the database via nodeService.createNode
And each has `createdFrom: 'agent'` and `semanticTypeSource: 'agent'`
And each has its semantic type set (person, place, topic)

#### Scenario: Agent node creation failure is graceful
Given the agent returns 5 nodes but node #3 fails to create (409 conflict)
When the response is processed
Then nodes 1, 2, 4, 5 are still created successfully
And a notification shows "4 of 5 nodes created (1 failed)"

### Requirement: Create Relationships from Agent Response

After creating agent nodes, the frontend MUST iterate `response.relationships[]` and create each as an attribute via `attributeService.createAttribute()`.

#### Scenario: Agent returns entity relationships
Given the agent creates nodes "Alice" (person) and "Acme" (place) and returns relationship `{ source: "Alice", target: "Acme", type: "relates_to" }`
When the response is processed
Then an attribute is created from Alice to Acme with type "relates_to"

### Requirement: Link Agent Nodes to Conversation

All agent-created nodes MUST be linked to the conversation node via `contains` attributes, maintaining order.

#### Scenario: Agent nodes are children of conversation
Given agent creates 3 nodes during a conversation
When the creation is complete
Then each node has a `contains` attribute from the conversation node
And the attributes have sequential order values

### Requirement: Cache Invalidation After Agent Processing

After all agent nodes and relationships are created, all relevant caches MUST be invalidated.

#### Scenario: Grid shows agent-created nodes
Given the agent creates 3 new nodes in space "my-space"
When the agent processing completes
Then `nodeKeys.list('my-space')` is invalidated
And the nodes appear in the node grid without manual refresh
And the graph view includes the new nodes and edges

### Requirement: Dedicated Agent Service (Optional)

The inline `fetch()` call to `/api/agents/process` in ChatPanel.tsx MUST be extracted into a dedicated `src/services/api/agent.service.ts`.

#### Scenario: Agent API call uses service layer
Given the chat panel needs to call the agent
When it sends a message
Then it calls `agentService.process()` instead of inline `fetch()`
And the service handles auth headers, error mapping, and retry logic consistently with other services
