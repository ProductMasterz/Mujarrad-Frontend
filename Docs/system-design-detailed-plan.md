# Mujarrad System Design Detailed Plan

## Document Purpose

This document defines the professional implementation plan and architecture for the **Mujarrad System Design** frontend work.

The goal of this branch is to build a new, well-structured System Design workflow without breaking or changing the existing frontend behavior. Current frontend features, routes, shell components, spaces, nodes, chat, docs, whiteboard, graph, and backend integrations must remain stable.

This document should be used by all contributors as the main reference before implementing any task related to the System Design project.

---

# Part 1 of 4 — Product Vision, Scope, and Core Rules

## 1. High-Level Vision

Mujarrad System Design is intended to become a professional AI-assisted system design workflow that helps users move from a natural-language idea into a structured system architecture.

The long-term architecture has three layers:

```text
Layer 1: System Design
Layer 2: Abstract Logic
Layer 3: Code Machine
```

For the current implementation phase, only **Layer 1: System Design** will be implemented.

Layer 2 and Layer 3 must appear in the UI as locked future stages, but they must not be functionally implemented yet.

---

## 2. Current Branch Strategy

This work happens only inside the current branch:

```text
feat/system-builder
```

The branch already contains an initial `/system-builder` route and a working simple Draw.io integration.

The current branch must continue independently. Contributors must not merge unrelated work from `main` unless explicitly requested by the project owner.

---

## 3. Very Important Rule: Do Not Break Existing Frontend Work

The current frontend already contains many working parts, including:

```text
Authentication
Chat
Docs
Spaces
Nodes
Graph
Whiteboard
Markdown rendering
Shell components
Navigation stores
Backend API services
System Builder route
Draw.io iframe integration
```

The new System Design work must be built professionally in new feature folders where possible.

Existing files should only be touched when required for clean routing or integration.

The preferred approach is:

```text
Keep existing frontend stable
Create new feature folder for System Design
Use wrappers/adapters around existing System Builder components
Avoid large destructive refactors
Avoid changing unrelated components
```

---

## 4. Existing System Builder Baseline

The branch currently includes:

```text
app/system-builder/page.tsx
src/components/system-builder/SystemBuilder.tsx
src/components/system-builder/DiagramLayer.tsx
src/components/system-builder/DrawioEmbed.tsx
app/api/system-builder/generate-diagram/route.ts
```

The current behavior is roughly:

```text
User writes prompt
→ frontend sends chat messages to /api/system-builder/generate-diagram
→ API calls OpenRouter
→ API returns Draw.io XML
→ Draw.io iframe loads diagram
```

This is a good prototype, but the professional System Design workflow must become more structured.

The future Layer 1 flow should not generate the diagram immediately from the first user message. It must first clarify the system requirements.

---

## 5. Final Layer 1 User Flow

Layer 1 must follow this flow:

```text
1. User describes the system idea in natural language.

2. User clicks Next.

3. AI analyzes the first description.

4. AI asks one constructive question.

5. User answers.

6. AI updates the current understanding.

7. AI asks the next constructive question based on:
   - the original user description
   - previous questions
   - previous answers
   - current understanding
   - missing information
   - completeness gaps

8. This loop continues until the system is sufficiently understood.

9. AI generates a structured Markdown system specification.

10. User reviews and edits the Markdown specification.

11. AI generates a Draw.io diagram from the full Layer 1 context.

12. User reviews the diagram.

13. User can manually edit the diagram inside Draw.io.

14. User can give text instructions to AI to refine the diagram.

15. AI refines the existing XML instead of starting from zero.

16. User approves the final diagram.

17. Layer 1 exports:
   - final Markdown specification
   - Draw.io XML
   - diagram summary
   - Layer 1 handoff JSON

18. Layer 2 remains locked for now.
```

---

## 6. Constructive Question Principle

The clarification loop is not a fixed questionnaire.

A bad implementation would ask a static list like:

```text
Who are the users?
What are the inputs?
What are the outputs?
What are the rules?
```

The correct implementation must ask constructive, cumulative questions.

Each question should be based on the current context.

Example:

```text
Original user input:
"I want a system where companies can find matching partners for projects."

AI question:
"When a company creates a project request, what information should it provide so the system can compare it with other companies?"
```

If the user answers:

```text
"They provide industry, required services, budget, location, and deadline."
```

The next AI question should build on that:

```text
"Should the matching score treat all of these fields equally, or should some fields such as required services and location have higher weight than budget?"
```

This is the expected behavior.

---

## 7. Layer 1 Must Be LangGraph-Ready

Even if the first frontend implementation uses local frontend orchestration or Next.js API routes, the architecture must be ready for a real LangGraph backend later.

The frontend should behave like a state machine and should not hide important logic inside random component state.

Future orchestration may look like this:

```text
receive_initial_description
→ summarize_current_understanding
→ detect_missing_information
→ generate_constructive_question
→ wait_for_user_answer
→ merge_answer_into_context
→ update_understanding
→ check_completeness
→ if incomplete: generate_next_question
→ if complete: generate_markdown_spec
→ generate_drawio_xml
→ review_diagram
→ refine_drawio_xml
→ export_layer1_package
```

The frontend must prepare for this by using typed state, services, adapters, and clear workflow stages.

---

## 8. What Is In Scope Now

The current phase includes:

```text
Layer 1 System Design workflow
Three-layer shell UI
Locked placeholders for Layer 2 and Layer 3
Initial chat
Constructive AI question loop
System understanding model
Completeness engine
Markdown specification generation
Draw.io generation
Draw.io review
Manual diagram editing
AI diagram refinement
Layer 1 export package
Layer 1 handoff JSON
Documentation
Tests for important utilities
Deployment/env readiness
```

---

## 9. What Is Out of Scope Now

The current phase does not include:

```text
Real Layer 2 Abstract Logic implementation
Real Layer 3 Code Machine implementation
Real code generation
Real deployment of generated code
Backend graph writing from Layer 1
Full LangGraph backend service
Full user/team permission redesign
Replacing the existing frontend shell
Replacing the existing chat system
Changing unrelated spaces/nodes/whiteboard behavior
```

Layer 2 and Layer 3 should only exist as locked visual placeholders.

---

## 10. Environment Rules

Local environment variables must stay in:

```text
.env.local
```

The example file committed to the repository should be:

```text
.env.example
```

No real secrets should be committed.

Required environment example:

```env
# Mujarrad backend API
NEXT_PUBLIC_API_URL=https://mujarrad.onrender.com

# Mujarrad agents service
NEXT_PUBLIC_AGENT_SERVICE_URL=https://mujarrad-agents-api.onrender.com

# Server-side AI provider key
# Do not expose this as NEXT_PUBLIC_ because it must stay server-side only.
OPENROUTER_API_KEY=

# Optional model override
SYSTEM_BUILDER_MODEL=google/gemini-2.0-flash-001

# System Builder / System Design feature flags
NEXT_PUBLIC_SYSTEM_BUILDER_MODE=api
NEXT_PUBLIC_ENABLE_LAYER_2=false
NEXT_PUBLIC_ENABLE_LAYER_3=false
```

Deployment environments such as Vercel, Render, or another server must define the real values in the platform settings.

---

# Part 2 of 4 — Frontend Architecture and Folder Structure

## 11. Architecture Goal

The System Design implementation should be built as a professional feature module.

The recommended feature path is:

```text
src/features/system-design/
```

This keeps the new work isolated from existing frontend modules.

Existing components under:

```text
src/components/system-builder/
```

can remain as wrappers or compatibility components.

The goal is not to destroy the current structure. The goal is to add a clean new architecture beside it.

---

## 12. Recommended Folder Structure

Create this structure:

```text
src/features/system-design/
├── components/
├── config/
├── prompts/
├── schemas/
├── services/
├── stores/
├── types/
└── utils/
```

Recommended full structure:

```text
src/features/system-design/
├── components/
│   ├── SystemDesignShell.tsx
│   ├── SystemDesignHeader.tsx
│   ├── LayerNavigation.tsx
│   ├── Layer1Shell.tsx
│   ├── Layer1InitialChat.tsx
│   ├── Layer1QuestionLoop.tsx
│   ├── QuestionCard.tsx
│   ├── QuestionHistory.tsx
│   ├── Layer1UnderstandingPanel.tsx
│   ├── Layer1CompletenessPanel.tsx
│   ├── Layer1SpecStep.tsx
│   ├── Layer1DiagramStep.tsx
│   ├── Layer1DiagramReview.tsx
│   ├── Layer1DiagramRefinement.tsx
│   ├── DiagramRevisionHistory.tsx
│   ├── Layer1ExportStep.tsx
│   ├── Layer2Locked.tsx
│   └── Layer3Locked.tsx
│
├── config/
│   └── systemDesignConfig.ts
│
├── prompts/
│   ├── constructiveQuestionPrompt.ts
│   ├── understandingUpdatePrompt.ts
│   ├── completenessPrompt.ts
│   ├── specGenerationPrompt.ts
│   ├── diagramGenerationPrompt.ts
│   └── diagramRefinementPrompt.ts
│
├── schemas/
│   └── layer1.schema.ts
│
├── services/
│   ├── layer1Orchestrator.ts
│   ├── localLayer1Orchestrator.ts
│   └── langgraphLayer1Client.ts
│
├── stores/
│   └── useLayer1Store.ts
│
├── types/
│   ├── layer1.types.ts
│   ├── layer2.types.ts
│   └── layer3.types.ts
│
└── utils/
    ├── completeness.ts
    ├── downloadFile.ts
    ├── drawioXml.ts
    ├── exportLayer1.ts
    ├── id.ts
    ├── markdownSpec.ts
    ├── questionCategories.ts
    ├── questionSelection.ts
    └── updateUnderstanding.ts
```

---

## 13. Route Strategy

The current route is:

```text
/system-builder
```

For now, keep this route to avoid breaking the branch.

The page title and UI should use the name:

```text
System Design
```

The route file should stay:

```text
app/system-builder/page.tsx
```

It should render:

```tsx
import { SystemBuilder } from '@/components/system-builder/SystemBuilder';

export const metadata = {
  title: 'System Design — Mujarrad',
};

export default function SystemBuilderPage() {
  return <SystemBuilder />;
}
```

Then `SystemBuilder.tsx` should become a small wrapper:

```tsx
'use client';

import { SystemDesignShell } from '@/features/system-design/components/SystemDesignShell';

export function SystemBuilder() {
  return <SystemDesignShell />;
}
```

This keeps backward compatibility while moving new implementation into the feature folder.

---

## 14. Layer Shell Architecture

The System Design page should visually contain three layers:

```text
Layer 1: System Design
Layer 2: Abstract Logic
Layer 3: Code Machine
```

Only Layer 1 is active.

Layer 2 and Layer 3 should show:

```text
Locked
Coming soon
Requires Layer 1 handoff
```

The shell should make it clear that Layer 1 produces the handoff package used later by Layer 2.

---

## 15. Layer 1 Workflow Stages

Layer 1 should be controlled by explicit workflow stages.

Recommended type:

```ts
export type Layer1Stage =
  | 'initial_chat'
  | 'clarification'
  | 'understanding'
  | 'specification'
  | 'diagram'
  | 'diagram_review'
  | 'export';
```

Recommended UI stepper:

```text
1. Initial Chat
2. Clarification
3. Understanding
4. Specification
5. Diagram
6. Review
7. Export
```

The UI should not allow users to jump to later stages before required data exists.

Example:

```text
Cannot open Diagram stage before Markdown specification exists.
Cannot export before diagram is approved.
```

---

## 16. Core State Model

Layer 1 should use a central store instead of scattered local state.

Recommended store file:

```text
src/features/system-design/stores/useLayer1Store.ts
```

The store should hold:

```ts
export interface Layer1Run {
  id: string;
  createdAt: string;
  updatedAt: string;
  stage: Layer1Stage;
  originalDescription: string;
  messages: Layer1ChatMessage[];
  questions: ConstructiveQuestion[];
  qaHistory: QuestionAnswer[];
  understanding: SystemUnderstanding;
  completeness: CompletenessReport | null;
  markdownSpec: string;
  drawioXml: string;
  diagramSummary: string;
  diagramApproved: boolean;
  diagramRevisions: DiagramRevision[];
  artifacts: Layer1Artifacts;
  errors: Layer1Error[];
}
```

The exact type can evolve during implementation, but the idea must remain stable.

---

## 17. System Understanding Model

The system understanding should become a structured object.

Recommended shape:

```ts
export interface SystemUnderstanding {
  summary: string;
  goal: string;
  primaryUsers: string[];
  secondaryUsers: string[];
  roles: string[];
  permissions: string[];
  workflows: WorkflowDescription[];
  alternativeWorkflows: WorkflowDescription[];
  inputs: SystemInput[];
  outputs: SystemOutput[];
  entities: SystemEntity[];
  businessRules: BusinessRule[];
  decisionLogic: DecisionRule[];
  validationRules: ValidationRule[];
  edgeCases: EdgeCase[];
  errorCases: ErrorCase[];
  integrations: IntegrationPoint[];
  notifications: NotificationRule[];
  reporting: ReportingRequirement[];
  security: SecurityRequirement[];
  openQuestions: string[];
  assumptions: string[];
  confidence: number;
}
```

This model is important because Layer 2 will eventually need structured input, not only a paragraph.

---

## 18. Constructive Question Model

Every AI question should be traceable.

Recommended shape:

```ts
export interface ConstructiveQuestion {
  id: string;
  question: string;
  category: QuestionCategory;
  reasonForAsking: string;
  basedOn: {
    originalDescription?: boolean;
    previousQuestionIds?: string[];
    previousAnswerIds?: string[];
    understandingFields?: string[];
    missingCategories?: string[];
  };
  expectedAnswerType:
    | 'short_text'
    | 'long_text'
    | 'list'
    | 'yes_no'
    | 'choice'
    | 'number'
    | 'structured';
  options?: string[];
  createdAt: string;
  answeredAt?: string;
  answer?: string;
  skipped?: boolean;
}
```

This prevents the AI loop from becoming random.

---

## 19. Completeness Model

The system should calculate whether the current understanding is ready for the next stage.

Recommended shape:

```ts
export interface CompletenessReport {
  overallScore: number;
  readyForSpec: boolean;
  readyForDiagram: boolean;
  categories: CompletenessCategoryStatus[];
  missingCriticalItems: string[];
  weakItems: string[];
  suggestedNextQuestionCategory?: QuestionCategory;
}
```

Each category can have this status:

```ts
export type CompletenessStatus =
  | 'complete'
  | 'weak'
  | 'missing'
  | 'not_applicable';
```

---

## 20. Handoff Package Model

Layer 1 should produce a handoff JSON package.

This package is not Layer 2 implementation. It is only the future input to Layer 2.

Recommended shape:

```ts
export interface Layer1HandoffPackage {
  layer: 1;
  status: 'completed';
  runId: string;
  originalDescription: string;
  qaHistory: QuestionAnswer[];
  systemUnderstanding: SystemUnderstanding;
  completenessReport: CompletenessReport;
  artifacts: {
    markdownSpec: string;
    drawioXml: string;
    diagramSummary: string;
  };
  traceability: {
    questions: ConstructiveQuestion[];
    diagramRevisions: DiagramRevision[];
  };
  readyForLayer2: boolean;
  createdAt: string;
}
```

---

# Part 3 of 4 — AI Orchestration, API Design, Draw.io, and Export Flow

## 21. Orchestration Design

Layer 1 should be implemented through a service interface.

Recommended file:

```text
src/features/system-design/services/layer1Orchestrator.ts
```

Recommended interface:

```ts
export interface Layer1Orchestrator {
  submitInitialDescription(input: SubmitInitialDescriptionInput): Promise<SubmitInitialDescriptionResult>;
  generateNextQuestion(input: GenerateNextQuestionInput): Promise<GenerateNextQuestionResult>;
  submitAnswer(input: SubmitAnswerInput): Promise<SubmitAnswerResult>;
  updateUnderstanding(input: UpdateUnderstandingInput): Promise<UpdateUnderstandingResult>;
  checkCompleteness(input: CheckCompletenessInput): Promise<CheckCompletenessResult>;
  generateSpec(input: GenerateSpecInput): Promise<GenerateSpecResult>;
  generateDiagram(input: GenerateDiagramInput): Promise<GenerateDiagramResult>;
  refineDiagram(input: RefineDiagramInput): Promise<RefineDiagramResult>;
  exportLayer1(input: ExportLayer1Input): Promise<Layer1HandoffPackage>;
}
```

This interface allows the frontend to switch later between:

```text
local Next.js API routes
LangGraph backend API
mock/local adapter for development
```

---

## 22. Local and LangGraph Adapters

Create:

```text
src/features/system-design/services/localLayer1Orchestrator.ts
src/features/system-design/services/langgraphLayer1Client.ts
```

The local adapter can call existing Next.js API routes.

The LangGraph adapter should be a production-ready client stub prepared for future backend endpoints.

Example future endpoints:

```text
POST /api/system-design/layer1/start
POST /api/system-design/layer1/question
POST /api/system-design/layer1/answer
POST /api/system-design/layer1/understanding
POST /api/system-design/layer1/completeness
POST /api/system-design/layer1/spec
POST /api/system-design/layer1/diagram
POST /api/system-design/layer1/refine-diagram
POST /api/system-design/layer1/export
```

For now, the frontend does not need all endpoints fully implemented, but the architecture must not block them.

---

## 23. AI Prompt Files

Prompts should be stored separately so contributors do not hide prompt logic inside components.

Recommended prompt files:

```text
src/features/system-design/prompts/constructiveQuestionPrompt.ts
src/features/system-design/prompts/understandingUpdatePrompt.ts
src/features/system-design/prompts/completenessPrompt.ts
src/features/system-design/prompts/specGenerationPrompt.ts
src/features/system-design/prompts/diagramGenerationPrompt.ts
src/features/system-design/prompts/diagramRefinementPrompt.ts
```

Prompt files should export functions, not only static strings, because prompts need context.

Example:

```ts
export function buildConstructiveQuestionPrompt(input: BuildQuestionPromptInput): string {
  return `
You are helping design a software system.

Original description:
${input.originalDescription}

Current understanding:
${JSON.stringify(input.understanding, null, 2)}

Previous Q&A:
${JSON.stringify(input.qaHistory, null, 2)}

Completeness gaps:
${JSON.stringify(input.completeness, null, 2)}

Ask exactly one constructive next question.
Return structured JSON only.
`;
}
```

---

## 24. API Route Strategy

The existing route is:

```text
app/api/system-builder/generate-diagram/route.ts
```

It currently focuses on diagram XML generation.

For the first professional implementation, it can be improved and reused for diagram generation/refinement.

Later, more API routes can be added.

Recommended diagram API payload:

```ts
export interface DiagramGenerationRequest {
  mode: 'generate' | 'refine';
  originalDescription: string;
  qaHistory: QuestionAnswer[];
  systemUnderstanding: SystemUnderstanding;
  markdownSpec: string;
  currentXml?: string;
  refinementInstruction?: string;
  revisionHistory?: DiagramRevision[];
}
```

Recommended response:

```ts
export interface DiagramGenerationResponse {
  xml: string;
  summary: string;
  warnings: string[];
}
```

---

## 25. Server-Side AI Rule

AI provider keys must stay server-side.

Correct:

```text
OPENROUTER_API_KEY
```

Wrong:

```text
NEXT_PUBLIC_OPENROUTER_API_KEY
```

Any variable starting with `NEXT_PUBLIC_` is exposed to the browser.

Therefore, OpenRouter or other AI provider secrets must never use `NEXT_PUBLIC_`.

---

## 26. Draw.io Integration Rules

The existing Draw.io embed should be preserved unless a tested replacement is implemented.

Current component:

```text
src/components/system-builder/DrawioEmbed.tsx
```

This should remain stable and reusable.

Recommended approach:

```text
Keep DrawioEmbed as low-level iframe component
Move Layer 1 workflow UI into src/features/system-design/components
Pass XML into DrawioEmbed
Listen to onXmlChange
Store latest XML in Layer 1 store
```

Draw.io should support:

```text
Load generated XML
Manual editing
Export/save current XML
AI refinement using current XML
Revision history
Approval before export
```

---

## 27. Draw.io XML Utilities

Create:

```text
src/features/system-design/utils/drawioXml.ts
```

Recommended functions:

```ts
export function extractMxGraphModel(raw: string): string;
export function sanitizeDrawioXml(xml: string): string;
export function validateDrawioXml(xml: string): DrawioValidationResult;
export function ensureMxGraphRoot(xml: string): string;
export function createEmptyDrawioXml(): string;
```

These utilities should protect the app from broken AI XML output.

---

## 28. Markdown Specification Generation

Create:

```text
src/features/system-design/utils/markdownSpec.ts
```

The final Markdown specification should follow this structure:

```markdown
# System Design Specification

## 1. System Overview

## 2. Main Goal

## 3. Users and Roles

## 4. Core Workflow

## 5. Alternative Workflows

## 6. Inputs

## 7. Outputs

## 8. Data Objects / Entities

## 9. Business Rules

## 10. Decision Logic

## 11. Validations

## 12. Edge Cases

## 13. Error Handling

## 14. Integrations

## 15. Security and Permissions

## 16. Notifications

## 17. Reporting / Logging

## 18. Diagram Generation Notes

## 19. Open Questions

## 20. Layer 2 Handoff Summary
```

The Markdown spec should be editable before generating the diagram.

Existing markdown components may be reused where suitable:

```text
src/components/markdown/MarkdownEditor.tsx
src/components/markdown/MarkdownRenderer.tsx
```

---

## 29. Export Requirements

Layer 1 must export four artifacts:

```text
final-system-spec.md
system-diagram.drawio.xml
system-diagram-summary.md
layer1-handoff.json
```

Create:

```text
src/features/system-design/components/Layer1ExportStep.tsx
src/features/system-design/utils/exportLayer1.ts
src/features/system-design/utils/downloadFile.ts
```

The export step should include:

```text
Download Markdown Spec
Download Draw.io XML
Download Diagram Summary
Download Layer 1 Handoff JSON
```

It should also show:

```text
Send to Layer 2 — Coming soon
```

That button must be disabled for now.

---

## 30. Traceability Requirements

The exported handoff JSON must preserve traceability.

It should show:

```text
Which original description started the process
Which questions were asked
Why each question was asked
Which answers were given
Which completeness gaps existed
Which diagram revisions happened
Which final artifacts were produced
```

This is important because future Layer 2 logic will depend on explainable structured input.

---

# Part 4 of 4 — Team Tasks, Implementation Order, Testing, and Contribution Rules

## 31. Six Main GitHub Project Tasks

The implementation should be divided into six major tasks.

Each task can be assigned to one contributor.

---

## Task 1 — System Design Foundation, Environment, and Three-Layer Shell

### Goal

Create the professional System Design shell and environment setup.

### Scope

```text
New feature folder
System Design page shell
Three-layer visual structure
Layer 1 active
Layer 2 locked
Layer 3 locked
Environment setup
Compatibility wrapper
```

### Files

```text
app/system-builder/page.tsx
src/components/system-builder/SystemBuilder.tsx
src/features/system-design/components/SystemDesignShell.tsx
src/features/system-design/components/SystemDesignHeader.tsx
src/features/system-design/components/LayerNavigation.tsx
src/features/system-design/components/Layer1Shell.tsx
src/features/system-design/components/Layer2Locked.tsx
src/features/system-design/components/Layer3Locked.tsx
src/features/system-design/config/systemDesignConfig.ts
.env.example
.gitignore
```

### Acceptance Criteria

```text
/system-builder loads
UI says System Design
Layer 1 is active
Layer 2 and Layer 3 are locked
Existing frontend remains stable
No secrets committed
npm run lint passes
npm run build passes
```

---

## Task 2 — Layer 1 State Model, Schemas, Store, and Orchestration Adapter

### Goal

Define the typed state model and orchestration interface.

### Scope

```text
Layer 1 types
Zod schemas
Zustand store
Local orchestrator adapter
LangGraph-ready client adapter
```

### Files

```text
src/features/system-design/types/layer1.types.ts
src/features/system-design/types/layer2.types.ts
src/features/system-design/types/layer3.types.ts
src/features/system-design/schemas/layer1.schema.ts
src/features/system-design/stores/useLayer1Store.ts
src/features/system-design/services/layer1Orchestrator.ts
src/features/system-design/services/localLayer1Orchestrator.ts
src/features/system-design/services/langgraphLayer1Client.ts
src/features/system-design/utils/id.ts
```

### Acceptance Criteria

```text
Layer 1 state is strongly typed
Store controls the workflow
Schemas validate important objects
Orchestrator interface exists
LangGraph client stub exists
Components do not own main workflow logic
npm run lint passes
npm run build passes
```

---

## Task 3 — Initial Chat and Constructive Question Loop

### Goal

Implement the beginning of Layer 1.

### Scope

```text
Initial system description input
Next button
Constructive AI question loop
One question at a time
Answer submission
Question history
```

### Files

```text
src/features/system-design/components/Layer1InitialChat.tsx
src/features/system-design/components/Layer1QuestionLoop.tsx
src/features/system-design/components/QuestionCard.tsx
src/features/system-design/components/QuestionHistory.tsx
src/features/system-design/prompts/constructiveQuestionPrompt.ts
src/features/system-design/utils/questionSelection.ts
src/features/system-design/utils/questionCategories.ts
```

### Acceptance Criteria

```text
User enters initial system description
User clicks Next
System asks one constructive question
User answers
Next question uses previous context
Question history is saved
Question metadata is visible or inspectable
Diagram generation is not triggered too early
npm run lint passes
npm run build passes
```

---

## Task 4 — System Understanding, Completeness, and Markdown Specification

### Goal

Convert the conversation into structured understanding and a Markdown specification.

### Scope

```text
Update system understanding after answers
Score completeness
Show missing and weak areas
Generate editable Markdown specification
Allow continue anyway when acceptable
```

### Files

```text
src/features/system-design/components/Layer1UnderstandingPanel.tsx
src/features/system-design/components/Layer1CompletenessPanel.tsx
src/features/system-design/components/Layer1SpecStep.tsx
src/features/system-design/utils/updateUnderstanding.ts
src/features/system-design/utils/completeness.ts
src/features/system-design/utils/markdownSpec.ts
src/features/system-design/prompts/understandingUpdatePrompt.ts
src/features/system-design/prompts/completenessPrompt.ts
src/features/system-design/prompts/specGenerationPrompt.ts
```

### Acceptance Criteria

```text
Understanding updates after each answer
Completeness report is generated
Missing critical items are shown
Markdown spec is generated
Markdown spec is editable
User can proceed when ready
npm run lint passes
npm run build passes
```

---

## Task 5 — Draw.io Generation, Review, Manual Edit, and AI Refinement

### Goal

Upgrade Draw.io integration into the official Layer 1 diagram workflow.

### Scope

```text
Generate diagram from full Layer 1 context
Load XML into Draw.io
Manual editing
AI refinement using current XML
Revision history
Diagram approval
```

### Files

```text
src/features/system-design/components/Layer1DiagramStep.tsx
src/features/system-design/components/Layer1DiagramReview.tsx
src/features/system-design/components/Layer1DiagramRefinement.tsx
src/features/system-design/components/DiagramRevisionHistory.tsx
src/features/system-design/utils/drawioXml.ts
src/features/system-design/prompts/diagramGenerationPrompt.ts
src/features/system-design/prompts/diagramRefinementPrompt.ts
src/components/system-builder/DrawioEmbed.tsx
app/api/system-builder/generate-diagram/route.ts
```

### Acceptance Criteria

```text
Diagram uses full Layer 1 context
Draw.io loads generated XML
Manual edits update current XML
AI refinement uses current XML and instruction
Revision history is stored
User can approve diagram
Export is blocked until approval
npm run lint passes
npm run build passes
```

---

## Task 6 — Export, Handoff JSON, Tests, Docs, and Deployment Readiness

### Goal

Finish Layer 1 as a professional deliverable.

### Scope

```text
Export files
Handoff JSON
Download utilities
Tests
Documentation
Deployment notes
Cleanup rules
```

### Files

```text
src/features/system-design/components/Layer1ExportStep.tsx
src/features/system-design/utils/exportLayer1.ts
src/features/system-design/utils/downloadFile.ts
src/features/system-design/utils/__tests__/questionSelection.test.ts
src/features/system-design/utils/__tests__/completeness.test.ts
src/features/system-design/utils/__tests__/markdownSpec.test.ts
src/features/system-design/utils/__tests__/drawioXml.test.ts
src/features/system-design/utils/__tests__/exportLayer1.test.ts
Docs/system-design-detailed-plan.md
Docs/system-design-env.md
Docs/system-design-layer1.md
```

### Acceptance Criteria

```text
Markdown spec can be downloaded
Draw.io XML can be downloaded
Diagram summary can be downloaded
Handoff JSON can be downloaded
Handoff JSON includes traceability
Layer 2 button remains disabled
Tests cover critical utilities
Docs are clear
No secrets committed
No local inspection files committed
npm run lint passes
npm run build passes
npm run test passes or known unrelated failures are documented
```

---

## 32. Recommended Task Dependency Order

```text
Task 1 must start first.

Task 2 depends on Task 1 folder structure.

Task 3 depends on Task 2 types/store.

Task 4 depends on Task 2 and works closely with Task 3.

Task 5 depends on Task 4 output, but can start early by refactoring Draw.io safely.

Task 6 depends on all tasks, but docs/test skeleton can start early.
```

Visual dependency:

```text
Task 1
  ↓
Task 2
  ↓
Task 3 ──→ Task 4 ──→ Task 5
  ↓          ↓          ↓
  └────────→ Task 6 ←───┘
```

---

## 33. Contribution Rules

All contributors must follow these rules:

```text
1. Do not break existing frontend behavior.

2. Do not merge unrelated main branch changes unless requested.

3. Do not commit .env.local.

4. Do not expose AI provider keys to the browser.

5. Do not install new packages unless necessary and approved.

6. Do not run npm audit fix --force unless it is a separate dependency task.

7. Keep new code inside src/features/system-design where possible.

8. Existing src/components/system-builder files should be treated as wrappers or reusable low-level components.

9. Components should not contain large orchestration logic.

10. Store, services, schemas, and utilities should hold workflow logic.

11. Every task must pass lint and build before review.

12. Layer 2 and Layer 3 must stay locked placeholders for now.

13. Handoff JSON must be designed for future Layer 2.

14. Draw.io XML must be validated before being loaded or exported.

15. The implementation must remain LangGraph-ready.
```

---

## 34. Testing Checklist

Each contributor should run:

```bash
npm run lint
npm run build
```

Task 6 should also run:

```bash
npm run test
```

The current branch baseline is:

```text
Lint passes with warnings only.
Build passes successfully.
```

Existing lint warnings are not part of this System Design task unless they are caused by the new work.

---

## 35. Git Hygiene

Before committing, check:

```bash
git status --short
```

Do not commit local inspection artifacts such as:

```text
branch-inspection/
branch-inspection-content/
branch-inspection.zip
branch-inspection-content.zip
```

Do not commit:

```text
.env.local
.env
```

Recommended cleanup after inspection:

```bash
rm -rf branch-inspection branch-inspection-content branch-inspection.zip branch-inspection-content.zip
```

---

## 36. Suggested GitHub Project Columns

Use:

```text
Backlog
Ready
In Progress
Needs Review
Blocked
Done
```

Suggested labels:

```text
system-design
layer-1
frontend
orchestration
drawio
langgraph-ready
env
testing
docs
blocked-by-task-1
blocked-by-task-2
```

---

## 37. Final Definition of Done for This Phase

This phase is complete when:

```text
/system-builder opens the new System Design shell
Layer 1 workflow is usable from description to export
Layer 2 and Layer 3 are visible but locked
AI clarification loop works constructively
System understanding is generated
Completeness is calculated
Markdown specification is generated and editable
Draw.io diagram is generated from full context
Diagram can be manually edited
Diagram can be AI-refined
Final artifacts can be exported
Handoff JSON is produced
Docs exist
Tests exist for critical utilities
No secrets are committed
Existing frontend behavior remains stable
npm run lint passes
npm run build passes
```

---

## 38. Summary

This project is not only a Draw.io page.

It is the first layer of a larger Mujarrad orchestration system.

The correct implementation must be:

```text
Professional
Typed
Traceable
Modular
LangGraph-ready
Safe for the existing frontend
Prepared for future Layer 2 and Layer 3
```

All contributors should follow this document before implementing their assigned tasks.


