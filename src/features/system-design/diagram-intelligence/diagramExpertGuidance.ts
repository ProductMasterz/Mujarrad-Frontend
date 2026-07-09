import type {
  DiagramType,
} from '../types/diagramIntelligence.types';

const EXPERT_GUIDANCE: Partial<
  Record<DiagramType, string>
> = {
  uml_activity: `
Use professional UML activity-diagram semantics.

Consider:
- initial nodes
- action/activity nodes
- decision nodes
- merge nodes
- fork and join nodes
- final nodes
- control flows
- guard conditions
- swimlanes when responsibility matters

Do not merely restyle architecture boxes.
Reconstruct workflow semantics faithfully.
Preserve decisions, alternatives, parallel paths, and failures when relevant.
`,

  uml_sequence: `
Use professional UML sequence-diagram semantics.

Consider:
- actors
- lifelines
- interaction order
- synchronous calls
- asynchronous messages
- responses
- activation periods
- alternative paths
- loops
- failure paths

Do not treat system components as unordered boxes.
Temporal interaction order is central.
`,

  uml_component: `
Use professional UML component-diagram semantics.

Consider:
- components
- provided interfaces
- required interfaces
- dependencies
- subsystem boundaries
- external systems

Focus on implementation structure and component responsibilities.
`,

  uml_deployment: `
Use professional UML deployment-diagram semantics.

Consider:
- physical or virtual nodes
- execution environments
- deployed artifacts
- networks
- regions
- clusters
- external infrastructure
- communication paths

Separate software responsibility from deployment topology.
`,

  uml_class: `
Use professional UML class-diagram semantics.

Consider:
- classes
- attributes
- operations
- inheritance
- composition
- aggregation
- associations
- multiplicity

Do not invent data-model details unsupported by context.
`,

  uml_state_machine: `
Use professional UML state-machine semantics.

Consider:
- initial state
- states
- transitions
- transition triggers
- guards
- actions
- final state
- composite states when justified

Focus on lifecycle and state transitions.
`,

  system_architecture: `
Use professional system-architecture principles.

Consider:
- actors
- system boundaries
- major subsystems
- external systems
- primary communication paths
- major data stores
- cross-cutting concerns

Preserve clarity over unnecessary implementation detail.
`,

  software_architecture: `
Use professional software-architecture principles.

Consider:
- layers
- modules
- services
- APIs
- data ownership
- synchronous communication
- asynchronous communication
- dependencies
- external integrations

Make responsibilities and boundaries explicit.
`,

  solution_architecture: `
Use professional solution-architecture principles.

Consider:
- business actors
- channels
- applications
- integrations
- services
- data platforms
- external systems
- deployment concerns
- security boundaries

Show end-to-end solution responsibility.
`,

  cloud_architecture: `
Use professional cloud-architecture principles.

Consider only relevant:
- regions
- availability zones
- edge services
- gateways
- compute
- orchestration
- messaging
- storage
- observability
- identity
- resilience
- disaster recovery

Do not add cloud services merely to appear advanced.
`,

  infrastructure_architecture: `
Use professional infrastructure-architecture principles.

Consider:
- hosts
- clusters
- networks
- load balancing
- storage
- compute
- deployment boundaries
- redundancy
- observability

Represent operational topology clearly.
`,

  network_architecture: `
Use professional network-architecture principles.

Consider:
- trust zones
- public and private segments
- routing
- gateways
- firewalls
- load balancers
- external connectivity
- internal connectivity

Make network and security boundaries explicit.
`,

  security_architecture: `
Use professional security-architecture principles.

Consider:
- trust boundaries
- identities
- authentication
- authorization
- secrets
- encryption
- policy enforcement
- audit
- external exposure
- threat-sensitive flows

Do not invent controls without relevance.
`,

  integration_architecture: `
Use professional integration-architecture principles.

Consider:
- producers
- consumers
- APIs
- events
- queues
- brokers
- protocols
- adapters
- external systems
- failure handling

Make integration direction and responsibility explicit.
`,

  data_flow: `
Use professional data-flow semantics.

Consider:
- data sources
- processes
- data stores
- sinks
- transformations
- flow direction
- data boundaries

Focus on movement and transformation of information.
`,

  data_pipeline: `
Use professional data-pipeline semantics.

Consider:
- sources
- ingestion
- validation
- transformation
- enrichment
- storage
- serving
- monitoring
- failure paths

Represent stage order and data lineage clearly.
`,

  event_driven_topology: `
Use professional event-driven architecture principles.

Consider:
- event producers
- events
- topics or streams
- consumers
- subscriptions
- retries
- dead-letter handling
- ordering
- idempotency
- eventual consistency

Do not replace all communication with events without justification.
`,

  ai_ml_pipeline: `
Use professional AI/ML pipeline semantics.

Consider:
- data sources
- ingestion
- preparation
- feature engineering
- training
- evaluation
- registry
- deployment
- inference
- monitoring
- feedback
- retraining

Separate training and inference flows when both exist.
`,

  rag_architecture: `
Use professional RAG architecture principles.

Consider:
- source ingestion
- parsing
- chunking
- embedding
- indexing
- retrieval
- reranking
- prompt construction
- generation
- citations
- evaluation
- observability

Represent offline indexing and online query flows separately when relevant.
`,

  agent_architecture: `
Use professional agent-system architecture principles.

Consider:
- user or caller
- orchestrator
- agents
- tools
- memory
- model access
- state
- human approval
- retries
- guardrails
- observability

Make control flow and tool boundaries explicit.
`,

  c4_context: `
Use C4 context-level semantics.

Show:
- people
- the system of interest
- external systems
- high-level relationships

Do not include low-level implementation details.
`,

  c4_container: `
Use C4 container-level semantics.

Show:
- applications
- APIs
- data stores
- major runtime containers
- responsibilities
- technologies only when useful
- relationships

Maintain a clear system boundary.
`,

  c4_component: `
Use C4 component-level semantics.

Show:
- components inside one container
- responsibilities
- dependencies
- interfaces
- relevant external dependencies

Do not mix unrelated deployment details.
`,

  entity_relationship: `
Use professional ER-diagram semantics.

Consider:
- entities
- attributes when known
- identifiers
- relationships
- cardinalities

Do not invent schema fields unsupported by context.
`,

  business_process: `
Use professional business-process semantics.

Consider:
- participants
- activities
- decisions
- events
- handoffs
- exceptions
- start and end conditions

Focus on business behavior rather than infrastructure.
`,

  swimlane: `
Use professional swimlane semantics.

Consider:
- lanes by actor, team, system, or responsibility
- ordered activities
- handoffs
- decisions
- exceptions
- start and end points

Use lanes only when responsibility separation matters.
`,

  flowchart: `
Use professional flowchart semantics.

Consider:
- start
- process
- decision
- input/output
- connectors
- end

Maintain clear directional flow.
`,
};

export function getDiagramExpertGuidance(
  diagramType: DiagramType,
): string {
  return (
    EXPERT_GUIDANCE[diagramType] ??
    `Use professional technical-diagram principles appropriate to the requested system and audience.

Preserve semantic correctness, clear hierarchy, meaningful relationships, readable grouping, and accurate system boundaries.`
  );
}
