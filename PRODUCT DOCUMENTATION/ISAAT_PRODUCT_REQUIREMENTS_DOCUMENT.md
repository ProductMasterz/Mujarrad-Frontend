# ISAAT (Information Systems Abstraction Application Technology) - Product Requirements Document

<aside>
💡 Note: Assume any thing not included in this dossier will not be released.
</aside>

| **Epic (Avion/Jira)** | ISAAT Platform MVP - Foundation Release |
| --- | --- |
| **Delivery Date** | Q4 2025 - Q2 2026 (Phased) |
| **Target release** | MVP: Q4 2025 / Full Platform: Q2 2026 |
| **Epic** | [ISAAT-001] Build Architecture-less Information Platform |
| **Document status** | DRAFT v1.0 |
| **Document owner** | Product Lead - ISAAT Platform |
| **Designer** | UX Design Lead |
| **Tech lead** | Chief Architect - ISAAT Technology |
| **Technical writers** | Documentation Team |
| **QA** | QA Engineering Lead |
| **Relevant Documents** | - ISAAT Abstract and Intro Sections.pdf<br>- 25 Feature Specification Documents<br>- Technical Architecture Documentation<br>- Complete Notion Scrape (241 pages) |

---

# 1. Overview


## Background Information

### Why are we doing this?

**The Fundamental Problem: The Abstraction Bottleneck**

ISAAT addresses a critical architectural bottleneck in how humans interact with information systems and computers. Currently, humanity is trapped in a paradigm where:

- **Information is naturally abstract** (like powder - malleable, flexible, easily changeable)
- **Applications force it to become concrete** (like hardened cement - rigid, expensive to change)
- **The cost of change is catastrophically high** - billions spent monthly on performance optimization and system modifications

**The Three-Layer Bottleneck:**
1. **Software Bottleneck**: Applications, architectures, compilation, execution
2. **Hardware Bottleneck**: Physical computing constraints
3. **Network Bottleneck**: Data transmission limitations

These bottlenecks force information through a cycle: Abstract → Concrete (compilation) → Machine Code → Concrete (execution) → Abstract (display). This process "suffocates" information and creates massive waste.

### How do we know this is a real problem and worth solving?

**Evidence of the Problem:**

1. **Market Validation**
   - Millions of applications exist, but users actively use very few
   - "Catastrophic waste" in the current app ecosystem
   - Organizations struggle to be truly data-driven despite massive technology investments

2. **Cost Evidence**
   - Billions spent monthly on performance optimization *within* the bottleneck
   - High-end calibers required just to manage information systems
   - Repeated development effort needed for every change

3. **Scientific Foundation**
   - Algorithm vs. Code paradox: Algorithms remain abstract; implementations become concrete
   - Even advanced systems (deep learning, OpenGL) cannot change in real-time
   - Mathematical equations stay abstract; computational applications become concrete

4. **Demo Results**
   - Workable demo with sample business data showed "incredibly promising" results
   - Proof of concept validates architecture-less architecture approach
   - Ready for researcher validation and gap-filling

### How does this fit into the overall company objectives?

**Strategic Alignment:**

1. **Upgrade Humanity's Information Interaction**
   - Position as the interface between human brain and computer
   - Enable "thoughts and meanings" as communication medium with computers
   - "ISAAT literally upgrades human communication with himself and others"

2. **Performance Revolution**
   - **10X productivity boost** with ISAAT alone
   - **100X productivity boost** when combined with AI/deep learning
   - "Same resources, exponentially better results"

3. **Market Leadership**
   - Pioneer new category: "Information Systems Abstraction Application Technology"
   - Not competing with existing tools but replacing the paradigm they operate within
   - Create foundational layer for all information-intensive work

4. **Waste Elimination & Value Creation**
   - Address investor trends toward "investing by heart" with human value priority
   - Enable cooperative waste elimination internally and externally
   - Build sustainable template and automation marketplace

### What problem is this solving?

**Core Problem Statement:**

Current information systems force users to choose between:
- **Concrete applications** that are powerful but inflexible and expensive to change
- **Abstract flexibility** that lacks computational capability

ISAAT solves this by maintaining information in its native abstract form while enabling full computational operations - eliminating the forced choice.

**Specific Problems Solved:**

1. **Organizational Inefficiency**
   - Can't be 100% data-driven, documented, or aligned due to tool limitations
   - Dedicated resources consumed by concrete features limiting future flexibility
   - Mental effort required daily just to manage information systems

2. **Change Cost Crisis**
   - Modifying systems requires breaking down concrete structures and rebuilding
   - Real-time algorithm changes impossible in current systems
   - Each iteration requires full development cycle

3. **Data Utilization Barrier**
   - Not feasible to be truly data-driven with current tools
   - "You don't know what you don't know" - hidden insights remain hidden
   - Requires expensive expert calibers to drive data strategy

4. **Collaboration Friction**
   - Information silos across tools and contexts
   - Steep learning curves prevent adoption
   - Pain-heavy contribution experiences reduce participation

### Who are we solving for?

**Target Personas:**

1. **Strategic Architect (Professional/White User)**
   - Chief Product Officer, Head of Strategy, Principal Architect
   - Creates reusable information structures for organizations
   - Builds contextual templates, attribution systems, automations

2. **Data-Driven Leader (Stakeholder User)**
   - Product Manager, Department Head, Executive
   - Makes informed decisions quickly without expert dependency
   - Achieves "iterations, focus, and momentum" for teams

3. **Knowledge Contributor (Member User)**
   - IC (Individual Contributor), Team Member, Domain Expert
   - Adds valuable input without complexity overhead
   - Seeks "seamless, pain-free" contribution experience

4. **Information Navigator (Active User)**
   - Analyst, Researcher, Cross-functional Coordinator
   - Finds, connects, understands information relationships
   - "Sees what they don't know" through data visibility

5. **Organizational Optimizer**
   - Operations Manager, Process Improvement Lead, Data Strategist
   - Eliminates waste, improves efficiency, enables data strategy
   - Seeks 10X-100X efficiency improvements

**Primary Markets:**

- **Business Applications**: Product management, strategic planning, data-driven organizations
- **Knowledge Work**: Research teams, consulting, educational institutions
- **Information-Intensive Industries**: Technology, professional services, healthcare, financial services

### What are the users benefits?

**Quantified Benefits:**

1. **Performance Multiplication**
   - 10X productivity boost (ISAAT alone)
   - 100X productivity boost (ISAAT + AI)
   - Same resources → exponentially better results

2. **Waste Elimination**
   - Eliminate repeated development effort
   - Cut billions spent on bottleneck optimization
   - Minimize unused application proliferation

3. **Cognitive Benefits**
   - "Clarity and precision are limitless"
   - Reduced mental effort for system management
   - Focus energy on important tasks, not overhead

4. **Flexibility & Adaptability**
   - Information stays abstract like "powder" - easily changeable
   - No need to "break down concrete" and rebuild
   - Real-time changes without recompilation
   - Architecture adapts to information, not vice versa

5. **Accelerated Iterations**
   - Frequency of high-quality iterations while focusing on findings
   - Pivot toward winning tactics faster
   - "Effortless momentum and focus eliminating hustle"
   - "Time traveling and time multiplication features"

6. **Enhanced Data Utilization**
   - Feasible to be truly data-driven
   - "Less painful way" to use iterative information
   - "On the spot" data access without leaving preview
   - Automatic suggestions and hypothesis building

---

## Core Architectural Principles

### "Everything is a Node" EiaN Architecture

ISAAT implements a unified node-based architecture where **contexts, templates, and all organizational structures are nodes**, not separate entities. This design principle enables true abstraction and flexibility:

**Key Principle: Contexts ARE Nodes**
- Contexts are not a separate table or entity type
- A context is simply a node with `node_type = 'context'` (or similar designation)
- This enables nodes to "be" contexts, eliminating artificial boundaries
- Supports the "architecture-less architecture" philosophy where structure emerges from nodes themselves

**Key Principle: Templates ARE Clean Context Nodes**
- Templates are not stored in a separate templates table
- Template creation process:
  1. **Duplicate** an existing context node (complete copy)
  2. **Clean** the duplicate by removing user-specific content
  3. **Preserve** the structural elements (attributes, nested nodes, relationships)
  4. **Mark** the node with `is_template = true` in `node_details` table
- This approach maintains consistency - templates are just nodes
- Template application = duplicate template node + customize with user content

**Key Principle: Relationships Define Structure**
- Nodes relate to other nodes via `attributes` table (wiring)
- A "context containing nodes" = attribute relationships with `attribute_type = 'contains'`
- Hierarchies emerge from relationship patterns, not rigid table structures
- This enables "super position" - nodes can have multiple parent contexts via multiple `contains` relationships

**Architectural Benefits:**
1. **Simplicity**: One core entity type (nodes), not dozens of specialized tables
2. **Flexibility**: New "types" emerge from node properties, not schema changes
3. **Consistency**: Same CRUD operations work for all node types
4. **Abstraction**: Information defines its own structure through relationships

### Application Modes - Implementation Strategy

**Architecture:** Client-side state management (no database persistence in MVP)

Application Modes control the user interface behavior, available operations, and data visibility without requiring separate application instances or database tables.

**Core Modes (MVP):**

1. **Scoped View Mode**
   - Filter displayed information by context, dimension, or attribute
   - UI shows subset of nodes based on active scope
   - Implementation: Client applies filters to API queries
   - Example: View only "Project Alpha" context nodes

2. **Full View Mode**
   - Display all nodes and relationships user has permission to see
   - No filtering applied
   - Implementation: API returns complete result sets

3. **Edit Mode**
   - Enable CRUD operations on nodes and attributes
   - Check permissions server-side before mutations
   - Implementation: UI shows edit controls, API enforces permissions
   - Roles allowed: Member, Editor, Admin

4. **Configure Mode** *(Admin only)*
   - Access system settings and configurations
   - Manage templates, types, automation
   - Implementation: Special UI routes, admin permission checks

5. **Setup Mode** *(Editor and above)*
   - Define context structures and hierarchies
   - Create organizational patterns
   - Implementation: Drag-drop UI for context relationships

6. **Utilization Mode** *(Default for Members)*
   - Use existing structures without modification
   - Focus on content creation within defined frameworks
   - Implementation: Read-only structure, editable content

**Advanced Modes (Phase 2):**

7. **View Display Mode** *(Deferred with VizViews)*
   - Dedicated presentation view for specific contexts
   - Clean display without utility details
   - Implementation: Custom rendering per context type

8. **Display Mode Annotate** *(Deferred with VizViews)*
   - Add non-destructive annotations and highlights
   - Annotations layered over original data
   - Implementation: Separate annotation nodes linked to targets

**Technical Implementation:**

```javascript
// Client-side mode state (Redux/Vuex example)
const applicationModeState = {
  currentMode: 'scoped_view',  // active mode
  scopeFilters: {
    contextId: 'uuid-123',
    dimensionType: 'party',
    dateRange: {...}
  },
  permissions: {
    canEdit: true,
    canConfigure: false,
    canSetup: true
  }
}

// Mode affects API queries
API.getNodes({
  ...filters,
  scope: applicationModeState.scopeFilters  // passed to server
})

// Mode affects UI rendering
if (applicationModeState.currentMode === 'edit') {
  showEditControls()
} else {
  hideEditControls()
}
```

**Mode Transitions:**
- Mode changes are instant (client-side state update)
- Server validates permissions when mode requires it
- Invalid mode transitions blocked at UI level
- Audit log tracks mode switches for compliance

**No Database Persistence Needed:**
- Modes are ephemeral UI states
- User preferences for default mode can be stored in `users` table
- Context-specific display modes stored in context node metadata (Phase 2)


# 2. Objectives

<aside>
💡 What the user will be able to do when the product is launched:
- Maintain information in abstract form while performing computational operations
- Achieve 10X-100X productivity improvements in information work
- Eliminate architectural bottlenecks in data-driven decision making
- Collaborate seamlessly across multi-dimensional information contexts
</aside>

| **Vision** | Become the universal interface between human mind and computer by maintaining maximum information abstraction while enabling computational operations - fundamentally transforming how humanity interacts with information systems. |
| --- | --- |
| **Goals** | **Phase 1 (Months 1-6)**: Launch MVP with Node-Context-Attribute architecture, basic client-side visualization, core Application Modes (Scoped, Full, Edit), User System<br><br>**Phase 2 (Months 7-12)**: Deploy advanced Application Modes, XD Contexts, Node Versioning, Async Communication, Information Attribution, Sharing & Privileges<br><br>**Phase 3 (Months 13-18)**: Complete all 25 features, AI integration, Template Marketplace, Context Templates, Analytics<br><br>**Phase 4 (Months 19-24)**: Scale features, Automation ecosystem (n8n), Enterprise capabilities, Performance optimization<br><br>**Phase 5 (Q3 2026+)**: Advanced VizViews with persistence, layout saving, multiple rendering modes<br><br>**Success Metrics**: <br>- 10X productivity improvement demonstrated with measurable case studies (measured post-MVP with analytics)<br>- 1,000+ contextual templates in marketplace<br>- 100+ enterprise organizations using platform<br>- 100,000+ active users across personas |
| **Initiatives** | 1. **Architecture-less Architecture**: Build node-based system where nodes define their own structure<br>2. **Visualization Foundation**: Basic node-relationship rendering (Advanced VizViews deferred to post-MVP)<br>3. **Abstraction Maintenance**: Keep information in syntactical form during operations<br>4. **Contextual Intelligence**: Implement context attribution and automatic suggestions<br>5. **Async Communication Excellence**: Deploy question-answer session automation<br>6. **Data-Driven Enablement**: Make 100% data-driven operation feasible<br>7. **Waste Elimination**: Replace concrete features with abstract capabilities<br>8. **User Empowerment Spectrum**: Support all user types from structure creators to content contributors |
| **Persona(s)** | - Strategic Architects (create structures)<br>- Data-Driven Leaders (make decisions)<br>- Knowledge Contributors (add content)<br>- Information Navigators (discover insights)<br>- Organizational Optimizers (eliminate waste) |

---

# 3. Release

| **Release** | ISAAT Platform v1.0 - "Foundation Release" |
| --- | --- |
| **Date** | **MVP**: Q4 2025 (October-December)<br>**Full v1.0**: Q2 2026 (April-June) |
| **Initiative** | Architecture-less Architecture Implementation + Abstraction Maintenance + Data-Driven Enablement |

## 🎯 Three-Phase Roadmap

### **Must Have (MVP - Phase 1)** — Q4 2025
**Focus**: Core architecture-less foundation for living information

1. ✅ **Epic 1**: Node Lifecycle & Versioning
   - Node CRUD with existence types (Essential, Purposed, Functional, Temporary)
   - Node types: basic node, attribute, mapping, conditional, **context**
   - Every-save versioning with time-machine
   - Archive/delete operations with dependency checking
   - Duplication detection within contexts

2. ✅ **Epic 3**: Wiring & Relationship Networks
   - Create semantic wires between nodes via attributes table
   - Relationship types: contains, depends_on, references, parent_of, relates_to
   - Wire interaction states (Selected, Highlighted, Hover tooltips)
   - Bulk wiring operations
   - Navigate connection networks via attribute queries

3. ✅ **Epic 4**: Attributes & Existence Information (Basic)
   - Define attributes with existence information
   - Attribute display types (label, button, block)
   - Basic attribute suggestions (rule-based)
   - Associate attributes with multiple nodes

4. ✅ **Epic 5**: Contexts & Emergent Architecture (Manual)
   - **Context nodes**: Create nodes with `node_type = 'context'`
   - **Containment**: Use `attribute_type = 'contains'` to define context-node relationships
   - **Multi-context membership**: Nodes can have multiple `contains` relationships (super position)
   - Context hierarchy via nested containment relationships
   - Context visibility/permissions via node-level permissions

5. ✅ **Epic 7**: Search Teleportation (Full-text)
   - Full-text search with fuzzy matching via search_index table
   - Search teleportation to target node and navigate to its parent contexts
   - Rank by relevance with highlighted matches
   - Search within context (filter by containment relationships) or global
   - Basic visualization navigation (advanced VizViews deferred)

6. ✅ **Epic 10**: Permissions & Access Control (Basic roles)
   - User roles: Guest, Member, Editor, Admin
   - Mode-based access control (client-side state management)
   - Basic object-level permissions on nodes (including context nodes)
   - Permission enforcement at API level

**Deliverable**: Functional node-based system with contexts-as-nodes, relationship-based structure, search, and permissions

**REMOVED FROM MVP (Moved to Future Phases):**
- ❌ **VizViews**: Advanced visualization features deferred to post-MVP
- Client-side visualization will use basic rendering of node-relationship data
- No VizView persistence, layout saving, or export features in MVP

---

### **Should Have (V1.0 - Phase 2)** — Q1 2026
**Focus**: Rich content, intelligence, and collaboration

8. ✅ **Epic 2**: Document Block Nodes
   - Documents as ordered collections of block nodes
   - Extract blocks to standalone nodes
   - Block node composition and reordering
   - Inline annotations and highlights

9. ✅ **Epic 8**: Templates & Context Duplication
   - **Template creation**: Duplicate context node → clean user content → mark `is_template = true`
   - **Template structure preservation**: Keep attributes, nested nodes, relationships during cleaning
   - **Template application**: Duplicate template node → customize with user content
   - Template library: Query nodes where `is_template = true`
   - Template categorization via tags in `node_details`

10. ✅ **Epic 9**: Activity Logs & Audit Trail
    - Capture all mutations (create/update/delete)
    - Activity log queries and visualization
    - Timeline view and heatmaps
    - Audit export and compliance

11. ✅ **Epic 11**: AI-Enhanced Features (Suggestions)
    - AI-powered attribute suggestions
    - ML-based context matching
    - Confidence scoring and learning
    - Batch suggestion generation

12. ✅ **Epic 5**: Contexts (ML-based suggestions)
    - Auto-suggest contexts from wiring patterns
    - ML clustering for similar nodes
    - Suggest context merges
    - Improve accuracy over time

**Deliverable**: Intelligent system with rich content capabilities, templates, and AI assistance

---

### **Nice to Have (V2.0 - Phase 3)** — Q2 2026 and Beyond
**Focus**: Advanced features, integrations, and marketplace

13. ✅ **Epic 11**: AI (Advanced NLP features)
    - Natural language node creation
    - Conversational knowledge base queries
    - AI-powered attribute suggestions
    - Bulk operations via commands

14. ✅ **Epic 12**: Import/Export (All formats)
    - Import: Markdown, CSV, Mind maps, GraphML
    - Export: Markdown, PDF, JSON, HTML
    - API & Webhooks for integrations
    - Bulk folder import (10k+ files)

15. ✅ **Epic 4**: Attributes (Advanced bulk operations)
    - Bulk apply to 100+ nodes
    - Family/system relation propagation
    - Preview changes before applying
    - Attribute templates

**Deliverable**: Full-featured platform with comprehensive integrations, advanced AI, and marketplace ready

---

### **Future Phases (Post-V2.0)** — Q3 2026+
**Focus**: Advanced visualization and enterprise features

16. ✅ **Epic 6**: VizViews & Advanced Visualization *(DEFERRED FROM MVP)*
    - Persistent visualization layouts (requires new `vizviews` table)
    - Multiple rendering modes: Graph, Tree, Timeline, Skeleton, Infrastructure, Facade
    - Layout saving and sharing
    - Progressive loading and virtual rendering
    - Export to PNG/PDF/SVG
    - Advanced filtering and path highlighting
    - Handle 2k+ nodes, 4k+ edges at >20 FPS with persistence

**Note**: MVP will use basic client-side visualization of node-relationship data without persistence.

---

## 📅 Key Milestones

| **Milestone** | **Date** | **Epic Completion** |
|---|---|---|
| **M1** | Month 3 | Epics 1, 3, 4 foundations |
| **M2** | Month 6 | MVP: Epics 1, 3, 4, 5, 6, 7, 10 complete |
| **M3** | Month 9 | Epics 2, 8, 9 complete |
| **M4** | Month 12 | Epic 11 (AI suggestions) complete |
| **M5** | Month 15 | Advanced VizViews and import/export |
| **M6** | Month 18 | Full v1.0 with all epics complete |

---

## 🔗 Dependencies

- **Frontend**: React/Vue framework for architecture-less UI + Vue.js state machine implementation
  - Basic client-side visualization of node-relationship graphs (no VizView persistence in MVP)
- **Backend**: Node-based API for unified CRUD operations
  - All entities (nodes, contexts, templates) use same node endpoints
- **Database**: PostgreSQL with existing schema
  - `nodes` table supports multiple `node_type` values: 'node', 'attribute', 'mapping', 'conditional', **'context'**
  - `attributes` table handles all relationships including containment via `attribute_type = 'contains'`
  - `node_details` table uses `is_template` flag to mark template nodes
- **AI/ML**: Integration with LLM for suggestions and generation
- **Infrastructure**: Scalable cloud infrastructure (10k+ concurrent operations)
- **Design**: UI/UX for node-based information architecture
  - Simplified visualization approach for MVP (defer advanced VizViews)

---

# 4. Success metrics

<aside>
💡 How do we know that we solved the problem?

**We will follow the following metrics to measure success:**
- **Time to first interaction**: Users create first node/context within 5 minutes of onboarding
- **Feature adoption rate**: 80% of users interact with core features within first week
- **Time spent**: Users spend average 2+ hours daily in platform (replacing other tools)
- **Abandonment rate**: <15% monthly churn for active users
- **Frequency**: Daily active use with 50%+ DAU/MAU ratio
- **Productivity multiplier**: Measurable 5X+ improvement in iteration speed (targeting 10X)
</aside>

| **Goal** | **Metric** |
| --- | --- |
| **Prove 10X productivity claim** | - Iteration cycle time reduced by 10X vs. traditional tools<br>- Time from data to decision reduced by 80%+<br>- Template reuse reducing setup time by 90%+ |
| **Achieve platform adoption** | - 100,000+ active users within 18 months<br>- 1,000+ organizations within 24 months<br>- 50%+ DAU/MAU ratio<br>- NPS score 50+ |
| **Demonstrate abstraction benefits** | - Changes implemented 10X faster than concrete apps<br>- Zero "breaking changes" requiring rebuilds<br>- Navigation between context nodes completes in <2 seconds |
| **Enable data-driven decision making** | - Users report 80%+ of decisions data-informed<br>- "Don't know what you don't know" discovery rate: 3+ insights per week<br>- Hypothesis validation cycle time <1 day |
| **Drive template marketplace** | - 1,000+ templates in marketplace<br>- 50%+ of users utilize templates<br>- Template reuse rate 100+ times per template<br>- User-generated templates contributing 60%+ |
| **Collaboration effectiveness** | - Async communication completion rate 90%+<br>- Average session gathering time reduced by 80%<br>- Cross-functional alignment score 4+/5 |
| **Waste elimination** | - Users consolidate from average 12 tools to 3<br>- Redundant data entry reduced by 90%+<br>- "Catastrophic waste" incidents (unused features) <5% |
| **User satisfaction** | - "Seamless, pain-free" experience rating 4.5+/5<br>- Steep learning curve eliminated: Time to proficiency <1 week<br>- Feature discovery rate 5+ features/month |

---

# 5. Assumptions

<aside>
💡 By listing assumptions we allow all cross-functional teams to poke holes at them, make suggestions and prove whether or not those assumptions are accurate.
</aside>

## Business Assumptions

1. **Market Readiness**
   - Organizations are actively seeking to eliminate waste in information systems
   - Decision-makers value human-centric technology and "investing by heart"
   - Market is ready for paradigm shift from concrete to abstract information systems

2. **Pricing & Monetization**
   - Users will pay premium for 10X productivity improvements
   - Template marketplace will generate sustainable transaction volume
   - Enterprise organizations will adopt license-based pricing at scale

3. **Adoption Pattern**
   - Professional users will create templates that member users consume
   - Network effects will drive viral adoption through template sharing
   - Early adopters will be data-driven organizations and product companies

## User Assumptions

4. **User Behavior**
   - Users can grasp "architecture-less architecture" concept with proper onboarding
   - Personas correctly identified: Professional, Stakeholder, Member, Active, Optimizer
   - Users will invest time learning abstract paradigm for long-term benefits

5. **User Needs**
   - "Iterations, focus, and momentum" are universal organizational goals
   - Pain of current concrete systems is severe enough to drive switching
   - Users want to be 100% data-driven but are limited by current tools

6. **Collaboration Patterns**
   - Async communication preferred over synchronous for information gathering
   - Users comfortable with AI-assisted suggestions and automation
   - Template-driven work preferred over building from scratch

## Technical Assumptions

7. **Architecture Viability**
   - Node-based "architecture-less architecture" can be implemented efficiently
   - Graph databases can handle attribution network complexity at scale
   - Real-time operations on abstract information achievable with acceptable performance

8. **Performance Claims**
   - 10X improvement achievable through abstraction maintenance alone
   - 100X improvement possible with AI integration
   - Bottleneck elimination demonstrable with measurable metrics

9. **Scalability**
   - XD (multi-dimensional) contexts can scale to enterprise data volumes
   - "Super position" (nodes in multiple locations) performant at scale
   - Visualization engine can handle complex graph rendering in real-time

10. **AI Integration**
    - LLMs can provide accurate attribution suggestions
    - Generative AI can create meaningful async communication sessions
    - AI can auto-populate visual templates without hallucination issues

## Product Assumptions

11. **Feature Priority**
    - Core features (Node-Context-Attribute) are sufficient for MVP value
    - Application Modes essential for preventing "Scratchup Abuse/Misuse"
    - VizViews critical for handling "expected noise" from abstraction power

12. **Research Dependency**
    - Visualization conflict resolution (mathematical) can be solved
    - "Time traveling" and "time multiplication" features viable
    - Neuroplasticity-inspired architecture implementable in software

13. **Competitive Positioning**
    - Current tools (Figma Jam, ClickUp, Obsidian, Notion) seen as complementary, not competitive
    - Users will view ISAAT as foundational layer beneath existing tools
    - Scientific approach differentiates from business-driven competitors

## Risk Assumptions

14. **UX Complexity**
    - Abstract concepts can be made accessible through Application Modes
    - AI can overcome "UX bottlenecks" identified in "To be handled" section
    - Guided usability prevents misuse without limiting power

15. **Change Management**
    - Organizations willing to rethink information architecture
    - Users can transition from concrete to abstract mindset
    - Training and support sufficient to overcome adoption barriers

---

# 6. Dependencies

## Internal Team Dependencies

**Design Team**
- Comprehensive UI/UX for abstract information visualization
- VizView rendering engine design
- Application Mode interaction patterns
- Template visual design system
- Onboarding experience for abstract concepts

**Engineering Teams**
- **Backend**: Node-context storage, attribution network, graph database
- **Frontend**: React/Vue architecture-less UI, real-time updates
- **Platform**: Scalable infrastructure, multi-tenant architecture
- **AI/ML**: LLM integration, suggestion engine, generative features
- **DevOps**: CI/CD pipeline, monitoring, performance optimization

**Data Team**
- Analytics instrumentation for 10X/100X performance measurement
- Node-based analytics implementation
- Dashboard creation for metrics tracking

**QA/Testing**
- Abstract system testing methodology
- Performance benchmarking (10X claim validation)
- User acceptance testing across all personas
- Template marketplace quality assurance

**Technical Writing**
- Documentation for 25 features
- Template creation guides
- API documentation for automation integrations
- Concept guides for abstract paradigm

**Research Team** (Critical)
- Mathematical modeling for visualization conflicts
- Neuroplasticity-inspired architecture research
- "Time traveling" and "time multiplication" R&D
- Performance validation studies

## External Dependencies

**Third-Party Services**
- **AI/ML Providers**: OpenAI/Anthropic for LLM integration
- **Cloud Infrastructure**: AWS/GCP/Azure for scalable hosting
- **Graph Database**: Neo4j or similar for attribution networks
- **Authentication**: OAuth providers for user management
- **Payment Processing**: Stripe for marketplace transactions
- **Automation Platform**: n8n integration for workflow automation

**Integration Partners**
- Productivity tools APIs (for migration and interoperability)
- Business intelligence tools (for data export)
- Communication platforms (Slack, Teams for notifications)

## Cross-Functional Dependencies

**Product Management**
- Prioritization of 25 features across phases
- Template marketplace strategy
- Pricing model finalization
- Go-to-market strategy

**Marketing**
- Education campaign for abstract paradigm
- Case study development for 10X claims
- Community building for template sharing
- Scientific validation publication

**Sales**
- Enterprise pilot program management
- Customer success playbooks
- Professional services for implementation

**Legal/Compliance**
- Data privacy compliance (GDPR, etc.)
- Intellectual property for "architecture-less architecture"
- Marketplace terms and conditions
- User-generated template licensing

## Technical Infrastructure Dependencies

**Must Have Before MVP:**
- Distributed graph database operational
- Basic VizView rendering engine
- Node-context-attribute data model implemented
- User authentication and authorization
- Real-time synchronization infrastructure

**Required for Scale:**
- Multi-region deployment
- Advanced caching for attribution network queries
- Template versioning and distribution system
- AI/ML model deployment infrastructure
- Analytics and monitoring platform

---

# 7. Milestones

## Phase 1: Foundation (Months 1-6)

### Milestone 1: Core Architecture (Month 3)
**Deliverables:**
- Node-Context-Attribute data model implemented
- Basic graph database operational
- Fundamental CRUD operations on nodes and contexts
- Simple attribution connections working

**Success Criteria:**
- 1,000 nodes can be created and connected in <1 second
- Contexts can contain other contexts (multi-dimensional)
- Attribution network queryable in <100ms

### Milestone 2: MVP Release (Month 6)
**Deliverables:**
- Basic VizViews (Grid, Graph, Document) operational
- Application Modes (Scoped, Full, Edit) implemented
- User System with Professional/Member/Active personas
- Information Attribution (core features)
- Sharing Context (basic)
- Find Information (search and discovery)
- Onboarding experience

**Success Criteria:**
- 100 beta users successfully complete onboarding
- Users create average 50+ nodes in first week
- Template reuse demonstrated
- 5X productivity improvement measured in pilot

## Phase 2: Enhancement (Months 7-12)

### Milestone 3: Advanced Capabilities (Month 9)
**Deliverables:**
- XD (Multi-Dimensional) Contexts fully functional
- Application Modes expanded (Configure, Setup, Display, Annotate, Utilization)
- Node Versioning with time-travel
- Async Communication (core features)
- Notifications system
- Privileges Configuration

**Success Criteria:**
- Users navigating 3+ dimensional contexts seamlessly
- Async communication sessions generating 90%+ completion
- Version history enabling true "time travel"

### Milestone 4: Collaboration & Templates (Month 12)
**Deliverables:**
- Context Templates (create, import, customize)
- Contextual Template Docking Modes (Full/Semi)
- Timelining Information
- Create Contextual Thread
- Sharing Context (advanced)
- Template Marketplace (beta)

**Success Criteria:**
- 100+ templates in marketplace
- 50%+ of users utilizing templates
- Template reuse reducing setup time by 80%+
- Users creating average 5+ templates each

## Phase 3: Intelligence & Scale (Months 13-18)

### Milestone 5: AI Integration (Month 15)
**Deliverables:**
- AI-powered attribution suggestions
- Generative async communication creation
- AI search with provable results
- Visual template auto-population
- Smart context recommendations
- Automated missing context detection

**Success Criteria:**
- AI suggestions accepted 60%+ of time
- Auto-generated async sessions match hand-crafted quality
- Search relevance >90%
- Template auto-population accuracy >80%

### Milestone 6: Full Platform v1.0 (Month 18)
**Deliverables:**
- All 25 features complete and operational
- Comprehensive VizViews (Grid, Graph, Timeline, Table, Board, List, etc.)
- Node Based Analytics
- Syntax Anatomy Systemization
- Cord (Dimensions) system
- Essential Types/Elements creation
- Pricing Features implemented
- Engineering Requirements fulfilled

**Success Criteria:**
- 10X productivity improvement demonstrated and validated
- 10,000+ active users
- 1,000+ templates in marketplace
- 100+ enterprise pilots initiated
- NPS score 50+

## Phase 4: Ecosystem & Scale (Months 19-24)

### Milestone 7: Automation & Integrations (Month 21)
**Deliverables:**
- n8n automation platform integration
- API and developer platform
- Third-party integrations (Slack, Teams, etc.)
- Scratchup Concrete Capability upgrades
- Mobile apps (iOS, Android)
- Desktop apps (Windows, Mac, Linux)

**Success Criteria:**
- 500+ automations created by users
- 50+ third-party integrations active
- Mobile DAU 30%+ of total

### Milestone 8: Enterprise & Market Leadership (Month 24)
**Deliverables:**
- Enterprise features (SSO, advanced security, compliance)
- Advanced analytics and reporting
- Professional services and training programs
- Scientific validation publication
- Case studies demonstrating 100X with AI

**Success Criteria:**
- 100X improvement validated with AI integration
- 100,000+ active users
- 1,000+ organizations
- Template marketplace self-sustaining
- Market recognition as category leader

# 8. Requirements & Features

## Epic-Based Feature Organization

This section organizes all 25 features into 12 epics that align with Agile/Scrum workflows. Each epic contains related user stories, acceptance criteria, functional requirements (FR), and non-functional requirements (NFR).

---

## 🎯 **Epic 1: Node Lifecycle & Versioning**

**Goal**: Enable users to create, version, and manage nodes with rich existence semantics so that information becomes a living entity.

**Priority**: P0 (Must Have - MVP Phase 1)

**Features Included**:
- Feature #3: Node System
- Feature #6: Nodes Versioning
- Feature #20: Creating Essential Types/Element

### User Stories

#### US-1.1: Create Default Nodes (Est: 3 pts)
**As a user**, I can create a default node with title and markdown body.

**Acceptance Criteria**:
- `POST /api/v1/nodes` returns 201 + node_id
- Node appears in DB and in primary context list
- Auto-generate unique slug
- Assign to primary context
- Choose existence type (Essential, Purposed, Functional, Temporary)
- Set node type (default, document, condition, start, end, custom)

#### US-1.2: Node Versioning & Time-Machine (Est: 3 pts)
**As an editor**, when I save a node, a new node_version is created.

**Acceptance Criteria**:
- Every save creates new version with change_summary
- `node_versions` row created automatically
- `GET /api/v1/nodes/:id` returns `current_version_id`
- View version history timeline
- Compare versions side-by-side
- Rollback to previous version
- Preview historical state in VizView

#### US-1.3: Archive Node (Est: 2 pts)
**As a user**, I can archive/unarchive a node.

**Acceptance Criteria**:
- `PATCH /api/v1/nodes/:id/archive` toggles `is_archived`
- Archived nodes excluded from default search but accessible
- Preserve wiring when archived
- Bulk archive operations support up to 100 nodes
- Trash/untrash with 30-day retention

#### US-1.4: Node Existence Types (Est: 3 pts)
**As a Professional user**, I can define node existence types that describe their purpose.

**Acceptance Criteria**:
- Essential Existence: Core permanent nodes
- Purposed Existence: Goal-oriented nodes
- Functional Existence: Utility/process nodes
- Temporary Existence: Ephemeral scratchpads
- Existence type enforces lifecycle rules

#### US-1.5: Duplication Detection & Merging (Est: 3 pts)
**As a user**, creating a node with identical title+body in same context triggers merge prompt.

**Acceptance Criteria**:
- Detect duplicates within same context
- Show similarity scores
- API returns `409 DUPLICATE` with merge suggestions
- Cross-context duplicates = suggest relationships (not error)
- Bulk deduplication wizard

### Functional Requirements

**FR-NODE-001**: System shall support creating nodes with title, markdown body, and existence type
**FR-NODE-002**: System shall auto-generate unique slug for each node
**FR-NODE-003**: System shall create new version on every node update
**FR-NODE-004**: System shall store version history with change_summary
**FR-NODE-005**: System shall support archive/unarchive operations
**FR-NODE-006**: System shall exclude archived nodes from default search
**FR-NODE-007**: System shall detect duplicate nodes within same context
**FR-NODE-008**: System shall suggest merge or relationship for duplicates
**FR-NODE-009**: System shall support 4 existence types: Essential, Purposed, Functional, Temporary
**FR-NODE-010**: System shall support bulk operations on up to 100 nodes

### Non-Functional Requirements

**NFR-NODE-001**: Node creation shall complete in <500ms (Performance)
**NFR-NODE-002**: Version history retrieval shall complete in <1 second for 100 versions (Performance)
**NFR-NODE-003**: Duplication detection shall run in <2 seconds (Performance)
**NFR-NODE-004**: System shall support 100,000+ nodes per user (Scalability)
**NFR-NODE-005**: Version storage shall be compressed and deduplicated (Efficiency)

---

## 📦 **Epic 2: Document Block Nodes & Rich Content**

**Goal**: Enable users to compose documents from interconnected blocks so that content is atomic and reusable.

**Priority**: P1 (Should Have - Phase 2)

**Features Included**:
- Feature #3: Node System (Document blocks)
- Feature #7: VizViews (Document mode)

### User Stories

#### US-2.1: Create Document Nodes (Est: 4 pts)
**As a user**, I can create a document node composed of ordered block nodes.

**Acceptance Criteria**:
- Document = ordered collection of block nodes
- Each paragraph/section = potential block node
- Rich-text editing with markdown
- Inline formatting and media
- Document stores ordered list of block IDs

#### US-2.2: Extract Blocks to Standalone Nodes (Est: 3 pts)
**As a user**, I can extract a paragraph into a standalone node preserving backlinks.

**Acceptance Criteria**:
- Select block and "Extract to Node"
- Creates new node with backlink automatically
- Original replaced with reference/embed
- Maintains document flow
- Operation returns new node_id

#### US-2.3: Block Node Composition (Est: 3 pts)
**As a user**, I can reorder and embed blocks from other documents.

**Acceptance Criteria**:
- Reorder blocks via drag-drop
- Embed blocks from other documents
- Transclude nodes as live references
- Create bidirectional block links
- Block changes reflect in all embeddings

#### US-2.4: Block Annotations (Est: 3 pts)
**As a user**, I can annotate blocks with inline highlights and comments.

**Acceptance Criteria**:
- Inline highlights and comments
- Annotation as lightweight attributes
- State-aware decorations (selected, highlighted)
- 3D visual effects for navigation
- Annotations stored as separate entities

### Functional Requirements

**FR-DOC-001**: System shall support document nodes containing ordered block nodes
**FR-DOC-002**: System shall enable extracting blocks to standalone nodes
**FR-DOC-003**: System shall create backlinks automatically on extraction
**FR-DOC-004**: System shall support block embedding and transclusion
**FR-DOC-005**: System shall propagate block changes to all embeddings
**FR-DOC-006**: System shall support inline annotations and highlights
**FR-DOC-007**: System shall store annotations as separate attribute entities

### Non-Functional Requirements

**NFR-DOC-001**: Document renders with <200ms for 100 blocks (Performance)
**NFR-DOC-002**: Block extraction completes in <500ms (Performance)
**NFR-DOC-003**: System shall support documents with 1000+ blocks (Scalability)

---

## 🔗 **Epic 3: Wiring & Relationship Networks**

**Goal**: Enable users to create semantic wires between nodes to build dynamic knowledge graphs.

**Priority**: P0 (Must Have - MVP Phase 1)

**Features Included**:
- Feature #4: Information Attribution (Wiring)
- Feature #9: Cord (Dimensions)

### User Stories

#### US-3.1: Create Wires (Est: 3 pts)
**As a user**, I can connect two nodes with a wire and select relation type.

**Acceptance Criteria**:
- Connect two nodes with wire
- `POST /api/v1/wires` creates edge
- Select relation type via attribute
- Set direction (one_way, two_way)
- Add wire metadata/description
- Visual wire creation in VizView
- VizView render shows the connection

#### US-3.2: Wire Interaction States (Est: 2 pts)
**As a user**, hovering a wire shows tooltip with attribute summary.

**Acceptance Criteria**:
- Wire states: Selected / Unselected / Highlighted Selected / Highlighted Unselected
- Hover shows metadata tooltip within 150ms
- Tooltip shows title + relation_type
- State machine per wire (frontend)
- Animation transitions between states (<100ms)

#### US-3.3: Bulk Wiring Operations (Est: 5 pts)
**As a user**, I can select multiple nodes and wire them to a target.

**Acceptance Criteria**:
- Select multiple nodes and wire to target
- Family/system relation propagation
- Wire templates for common patterns
- Undo/redo wire operations
- Bulk wire creation supports 100+ operations

#### US-3.4: Navigate Wiring Networks (Est: 3 pts)
**As a user**, I can follow wires to explore connected nodes.

**Acceptance Criteria**:
- Follow wires to connected nodes
- View all incoming wires (backlinks)
- View all outgoing wires
- Filter wires by relation type
- Trace connection paths
- No orphaned wires (cascade deletion)

### Functional Requirements

**FR-WIRE-001**: System shall create wires with source, target, direction, relation_attribute_id
**FR-WIRE-002**: System shall support one_way and two_way wire directions
**FR-WIRE-003**: System shall display wire metadata on hover
**FR-WIRE-004**: System shall support bulk wire creation (100+ operations)
**FR-WIRE-005**: System shall provide wire navigation (incoming/outgoing)
**FR-WIRE-006**: System shall cascade delete wires when nodes deleted
**FR-WIRE-007**: System shall filter wires by relation type

### Non-Functional Requirements

**NFR-WIRE-001**: Wire creation shall complete in <300ms (Performance)
**NFR-WIRE-002**: Wire state transitions shall be smooth (<100ms) (Usability)
**NFR-WIRE-003**: Tooltip appears within 150ms (Usability)
**NFR-WIRE-004**: System shall support 10,000+ wires per context (Scalability)

---

## 🏷️ **Epic 4: Attributes & Existence Information**

**Goal**: Enable users to define attributes with existence information so that nodes self-describe their architecture.

**Priority**: P0 (Must Have - MVP Phase 1)

**Features Included**:
- Feature #4: Information Attribution
- Feature #8: Syntax Anatomy Systemization

**Syntax Anatomy Implementation Approach:**

Syntax anatomy enables breaking down complex syntax/documents into reusable clause components:
- **Anatomy template** = context node with metadata `{template_type: 'syntax_anatomy'}`
- **Clauses** = child nodes representing syntax components
- **Clause hierarchy** = nested containment relationships
- **Clause composition** = ordering via metadata `{clause_order: N}`
- **Clause reuse** = same clause node can appear in multiple anatomies (super position)

```javascript
// Example: Anatomy template for "Product Requirements"
{
  node_type: 'context',
  title: 'PRD Anatomy Template',
  metadata: {
    template_type: 'syntax_anatomy',
    structure: {
      clauses: [
        {clause_id: 'uuid-1', title: 'Executive Summary', order: 1},
        {clause_id: 'uuid-2', title: 'Problem Statement', order: 2},
        {clause_id: 'uuid-3', title: 'Solution Approach', order: 3}
      ]
    }
  }
}

// Each clause is a node that can be independently iterated
```

**Database Support:** Uses existing `nodes` (for clauses) and `attributes` (for clause relationships). Stored in metadata.

### User Stories

#### US-4.1: Create Attributes (Est: 4 pts)
**As a user**, I can create attributes with title and properties.

**Acceptance Criteria**:
- Define attribute with title and properties
- Associate with multiple nodes
- Set display type (label, button, tag, block, data_element)
- Configure existence information per context
- `POST /api/v1/attributes` persists object
- Existence info validated

#### US-4.2: Existence Information Management (Est: 4 pts)
**As a Professional user**, I can define existence information for attributes.

**Acceptance Criteria**:
- Define existed_node (attribute refers to)
- Define existence_node (container)
- Set existence_type (origin, clone, prefab, temporary)
- Set relation_type (has_a, depends_on, part_of, etc.)
- Link to specific context
- Existence information tracked per context

#### US-4.3: Attribute Suggestions (Rule-Based) (Est: 3 pts)
**As a user**, the system suggests relevant attributes based on keywords.

**Acceptance Criteria**:
- System suggests attributes based on keywords
- Shared context = suggest common attributes
- Confidence scoring
- Accept/reject suggestions
- `GET /api/v1/attributes/suggest?node_id=...` returns ranked list
- Suggestions return within 500ms
- Learn from user choices

#### US-4.4: Bulk Attribute Application (Est: 5 pts)
**As a user**, I can apply attribute to up to 100 nodes with propagation.

**Acceptance Criteria**:
- Apply attribute to tree of nodes
- Propagate family/system relations
- Preview changes before applying
- Apply to up to 100 nodes at once
- Endpoint returns `applied_count` + per-node status
- Bulk operations show preview before commit

#### US-4.5: Attribute Display Modes (Est: 3 pts)
**As a user**, I see attributes rendered differently based on display type.

**Acceptance Criteria**:
- Label form: Simple text tag
- Button form: Clickable interaction
- Block form: Full node rendering
- Data element form: Structured data (Jira-style)
- VizView renderer respects `display_type`

### Functional Requirements

**FR-ATTR-001**: System shall create attributes with title, properties JSONB, and display type
**FR-ATTR-002**: System shall store existence information per context
**FR-ATTR-003**: System shall suggest attributes based on node content
**FR-ATTR-004**: System shall support bulk attribute application to 100+ nodes
**FR-ATTR-005**: System shall render attributes per display type (label/button/block/data_element)
**FR-ATTR-006**: System shall associate attributes with multiple nodes
**FR-ATTR-007**: System shall validate existence information on creation

### Non-Functional Requirements

**NFR-ATTR-001**: Attribute creation shall complete in <400ms (Performance)
**NFR-ATTR-002**: Suggestions return within 500ms (Performance)
**NFR-ATTR-003**: Bulk operations complete in <5 seconds for 100 nodes (Performance)
**NFR-ATTR-004**: System shall support 10,000+ attributes per workspace (Scalability)

---

## 🌐 **Epic 5: Contexts & Emergent Architecture**

**Goal**: Enable contexts to emerge dynamically from wiring patterns so that organization is natural.

**Priority**: P0 (Must Have - MVP Phase 1) + P1 (Should Have - Phase 2 for ML)

**Architecture**: Contexts are nodes with `node_type = 'context'`. Containment is expressed via `attribute_type = 'contains'` relationships.

**Features Included**:
- Feature #5: XD Contexts
- Feature #11: Sharing Context
- Feature #16: Implement Context Template
- Feature #19: Create New Context Template

### User Stories

#### US-5.1: Create Context Nodes (Est: 3 pts)
**As a user**, I can create context nodes to organize information.

**Acceptance Criteria**:
- Create node with `node_type = 'context'`
- Define context title, description in node fields
- Set context visibility/permissions using node-level permissions
- Context nodes appear in same `nodes` table as all other nodes
- Context nodes can be queried: `SELECT * FROM nodes WHERE node_type = 'context'`

#### US-5.2: Context Suggestion & Auto-Creation (Est: 3 pts)
**As a user**, the system suggests context when wiring multiple nodes.

**Acceptance Criteria**:
- System suggests context when wiring multiple nodes
- ML-based context matching
- Confidence scoring with >70% accuracy
- Auto-create context if wiring threshold met
- Suggest merging similar contexts
- Suggestions appear when 3+ nodes wired together

#### US-5.3: Multi-Context Node Membership ("Super Position") (Est: 3 pts)
**As a user**, nodes can exist in multiple contexts simultaneously.

**Acceptance Criteria**:
- Node can have multiple incoming `contains` relationships from different context nodes
- Query: `SELECT context.* FROM nodes context JOIN attributes a ON a.source_node_id = context.id WHERE a.target_node_id = :node_id AND a.attribute_type = 'contains'`
- Designate one relationship as "primary" via attribute properties `{is_primary: true}`
- API returns all parent contexts when querying node
- Node appears in multiple contexts without duplication (same node instance)

#### US-5.4: Context Hierarchy via Containment (Est: 3 pts)
**As a user**, I can organize contexts hierarchically.

**Acceptance Criteria**:
- Context nodes can contain other context nodes via `contains` relationships
- Query nested contexts: Traverse `contains` relationships recursively
- Support up to 10 levels of nesting
- Hierarchy visualization in UI shows parent-child context relationships
- Moving context = updating `contains` attribute relationships

### Functional Requirements

**FR-CTX-001**: System shall create context nodes with `node_type = 'context'`
**FR-CTX-002**: System shall suggest contexts based on wiring patterns (AI/ML)
**FR-CTX-003**: System shall support multi-context membership via multiple `contains` attributes
**FR-CTX-004**: System shall designate one primary context via `{is_primary: true}` in attribute properties
**FR-CTX-005**: System shall support context hierarchy via nested `contains` relationships up to 10 levels
**FR-CTX-006**: System shall auto-suggest context when 3+ nodes wired together
**FR-CTX-007**: System shall inherit permissions from parent context nodes

### Non-Functional Requirements

**NFR-CTX-001**: Context node creation shall complete in <400ms (Performance)
**NFR-CTX-002**: Context suggestions return within 1 second (Performance)
**NFR-CTX-003**: ML context matching accuracy >70% (Accuracy)
**NFR-CTX-004**: System shall support 10,000+ context nodes per workspace (Scalability)
**NFR-CTX-005**: Containment queries (finding parent contexts) shall complete in <200ms (Performance)

---

## 👁️ **Epic 6: VizViews & Visualization Modes** ❌ **OUT OF SCOPE FOR MVP**

**Goal**: Provide powerful visualization views to understand complex knowledge structures.

**Priority**: ~~P0 (Must Have - MVP Phase 1)~~ → **DEFERRED to Post-V2.0 (Q3 2026+)**

**MVP Alternative**: Basic client-side rendering of node-relationship data without persistence, layout saving, or advanced visualization modes.

**Features Included** *(All Deferred)*:
- Feature #7: VizViews (Deferred)
- Feature #2: Application Modes - View Display Mode (Deferred)

### User Stories

#### US-6.1: Create VizViews (Est: 5 pts)
**As a user**, I can create a VizView for a context or node cluster.

**Acceptance Criteria**:
- Define VizView for context or node cluster
- Name and describe purpose
- Select root context or node
- Configure initial layout settings
- VizView persists with layout and filters

#### US-6.2: VizView Layout Management (Est: 3 pts)
**As a user**, I can save current layout and load saved layouts.

**Acceptance Criteria**:
- Save current layout (positions, zoom, filters)
- Load saved layout within 2 seconds for 2k nodes
- Version layouts (history)
- Share layouts with team
- Export layout configuration
- `POST /api/v1/vizviews` returns id
- `GET /api/v1/vizviews/:id` returns stored config

#### US-6.3: VizView Rendering Modes (Est: 5 pts)
**As a user**, I can switch between different VizView rendering modes.

**Acceptance Criteria**:
- Graph Mode: Interactive node-edge graph
- Tree Mode: Hierarchical tree view
- Timeline Mode: Chronological layout
- Skeleton Mode: Base structure only
- Infrastructure Mode: Dense/unfiltered
- Facade Mode: Simplified for casual users
- All modes supported with consistent UX

#### US-6.4: Interactive VizView Features (Est: 4 pts)
**As a user**, I can interact with VizViews through pan, zoom, select, and filter.

**Acceptance Criteria**:
- Pan and zoom (smooth 60 FPS)
- Select/multi-select nodes
- Filter by node type, attributes, date
- Search within view
- Highlight paths between nodes
- Node inspector panel (side drawer)
- API provides attributes, backlinks, versions within 200ms

#### US-6.5: VizView Performance (Est: 5 pts)
**As a system**, I can render large graphs performantly.

**Acceptance Criteria**:
- Progressive loading for large graphs
- Handle 2k+ nodes, 4k+ edges
- Maintain >20 FPS during interaction
- Virtual rendering for off-screen nodes
- Level-of-detail (LOD) rendering
- Performance targets met on standard hardware

#### US-6.6: Export VizView (Est: 3 pts)
**As a user**, I can export current VizView to PDF or PNG.

**Acceptance Criteria**:
- `POST /api/v1/vizviews/:id/export?format=pdf` returns downloadable file
- Export to PNG/PDF/SVG
- Maintain visual quality
- Include metadata in export

### Functional Requirements

**FR-VIZ-001**: System shall create VizViews with name, description, root context/node
**FR-VIZ-002**: System shall save and load VizView layouts
**FR-VIZ-003**: System shall support 6 rendering modes (Graph, Tree, Timeline, Skeleton, Infrastructure, Facade)
**FR-VIZ-004**: System shall support pan, zoom, select, filter operations
**FR-VIZ-005**: System shall highlight paths between nodes
**FR-VIZ-006**: System shall provide node inspector panel
**FR-VIZ-007**: System shall export VizViews to PNG/PDF/SVG

### Non-Functional Requirements

**Note:** These NFRs apply to advanced VizViews (deferred to Q3 2026+), not MVP.

**NFR-VIZ-001**: *(Deferred)* VizView render at >20 FPS for 2k nodes, 4k edges (Performance)
**NFR-VIZ-002**: *(Deferred)* Layout loads within 2 seconds for 2k nodes (Performance)
**NFR-VIZ-003**: *(Deferred)* Node inspector loads within 200ms for 200 refs (Performance)
**NFR-VIZ-004**: *(Deferred)* System shall support progressive loading for large graphs (Scalability)
**NFR-VIZ-005**: *(Deferred)* All modes shall have consistent UX (Usability)

**MVP Visualization NFR:**
**NFR-VIZ-MVP-001**: Basic client-side rendering shall display up to 500 visible nodes smoothly (Performance)

---

## 🔍 **Epic 7: Search Teleportation & Discovery**

**Goal**: Enable users to find and jump to information instantly for effortless navigation.

**Priority**: P0 (Must Have - MVP Phase 1)

**Features Included**:
- Feature #12: Find Information

### User Stories

#### US-7.1: Full-Text Search (Est: 4 pts)
**As a user**, fuzzy search opens node in its context (teleport).

**Acceptance Criteria**:
- Search across all node content
- Fuzzy matching with typo tolerance
- Rank by relevance
- Highlight matches in results
- Search within context or global
- `GET /api/v1/search?q=...` returns node + parent contexts + navigation path
- Search returns results within 1 second
- Full-text index stays synchronized

#### US-7.2: Search Teleportation (Est: 3 pts)
**As a user**, clicking a search result navigates to the node in its context.

**Acceptance Criteria**:
- Click result = navigate to node in its context
- UI displays target node with context hierarchy
- Breadcrumb trail shows navigation path
- Back/forward navigation stack
- Deep linking to specific node+context
- Basic visualization shows node relationships

#### US-7.3: Advanced Search Filters (Est: 3 pts)
**As a user**, I can filter search results by multiple criteria.

**Acceptance Criteria**:
- Filter by node type
- Filter by existence type
- Filter by attribute/relation type
- Date range filtering
- Creator/modifier filtering
- Boolean operators (AND, OR, NOT)
- Support pagination for large result sets

#### US-7.4: Search Suggestions & Auto-Complete (Est: 2 pts)
**As a user**, I receive real-time search suggestions.

**Acceptance Criteria**:
- Real-time search suggestions
- Recently searched queries
- Popular searches
- Related terms
- Quick filters in results

### Functional Requirements

**FR-SEARCH-001**: System shall provide full-text search across all nodes
**FR-SEARCH-002**: System shall support fuzzy matching with typo tolerance
**FR-SEARCH-003**: System shall rank results by relevance
**FR-SEARCH-004**: System shall navigate to node+context with visualization on result click
**FR-SEARCH-005**: System shall support advanced filters (type, date, creator, etc.)
**FR-SEARCH-006**: System shall provide search suggestions and auto-complete
**FR-SEARCH-007**: System shall maintain breadcrumb navigation trail

### Non-Functional Requirements

**NFR-SEARCH-001**: Search returns results within 1 second (Performance)
**NFR-SEARCH-002**: Full-text index synchronized in real-time (Consistency)
**NFR-SEARCH-003**: System shall support 100,000+ indexed nodes (Scalability)
**NFR-SEARCH-004**: Search accuracy >90% for fuzzy matches (Accuracy)

---

## 📋 **Epic 8: Templates & Context Duplication**

**Goal**: Enable users to create and apply templates by duplicating and cleaning context nodes.

**Priority**: P1 (Should Have - Phase 2)

**Architecture**: Templates are context nodes marked with `is_template = true`. No separate templates table.

**Features Included**:
- Feature #16: Implement Context Template
- Feature #19: Create New Context Template

### User Stories

#### US-8.1: Create Templates via Duplication (Est: 4 pts)
**As a Professional user**, I can create templates by duplicating and cleaning context nodes.

**Acceptance Criteria**:
- **Step 1 - Duplicate**: Clone an existing context node (copy all data)
- **Step 2 - Clean**: Remove user-specific content from the duplicate
- **Step 3 - Preserve**: Keep structural elements (attributes, nested nodes, relationships)
- **Step 4 - Mark**: Set `is_template = true` in `node_details` table
- Template categorization via `tags` array in `node_details`
- Template versioning via `node_versions` (same as any node)

#### US-8.2: Template Application via Duplication (Est: 4 pts)
**As a user**, I can apply templates by duplicating them and customizing.

**Acceptance Criteria**:
- **Step 1 - Find template**: Query nodes where `is_template = true`
- **Step 2 - Duplicate**: Clone the template node (full copy)
- **Step 3 - Customize**: Add user-specific content to the duplicate
- **Step 4 - Unmark**: Set `is_template = false` on the new instance
- Preserve all structural elements from template (attributes, relationships)
- Create backlink to source template via `template_id` in `node_details`

#### US-8.3: Template Library (Est: 3 pts)
**As a user**, I can browse and search available templates.

**Acceptance Criteria**:
- Query templates: `SELECT * FROM nodes n JOIN node_details nd ON n.id = nd.node_id WHERE nd.is_template = true`
- Filter by tags: `WHERE 'category_name' = ANY(nd.tags)`
- Search template titles and descriptions
- Preview template structure (view nodes, attributes, relationships)
- Share templates by granting permissions on template nodes

### Functional Requirements

**FR-TMPL-001**: System shall create templates by duplicating context nodes and marking `is_template = true`
**FR-TMPL-002**: System shall preserve structural elements during template cleaning (attributes, nested nodes)
**FR-TMPL-003**: System shall apply templates by duplicating template nodes
**FR-TMPL-004**: System shall query templates via `is_template` flag
**FR-TMPL-005**: System shall categorize templates via `tags` array
**FR-TMPL-006**: System shall track template source via `template_id` foreign key
**FR-TMPL-007**: System shall version templates via `node_versions` table

### Non-Functional Requirements

**NFR-TMPL-001**: Template duplication completes in <2 seconds (Performance)
**NFR-TMPL-002**: Template application completes in <5 seconds (Performance)
**NFR-TMPL-003**: System shall support 1,000+ template nodes (Scalability)
**NFR-TMPL-004**: Template queries return within 500ms (Performance)

---

## 📊 **Epic 9: Activity Logs & Audit Trail**

**Goal**: Provide comprehensive activity logs so that all actions are auditable.

**Priority**: P1 (Should Have - Phase 2)

**Features Included**:
- Feature #21: Node Based Analytics
- Feature #24: Engineering Requirements (Logging)

### User Stories

#### US-9.1: Capture All Mutations (Est: 2 pts)
**As a system**, all create/update ops are logged.

**Acceptance Criteria**:
- Log node create/update/delete
- Log attribute create/update/delete
- Log wire create/delete
- Log context operations
- Log template docking
- Every mutation creates log entry
- Logs include user, timestamp, payload

#### US-9.2: Activity Log Queries (Est: 3 pts)
**As a user**, I can query my activity history.

**Acceptance Criteria**:
- View my activity history
- View activity by user
- View activity by object (node, attribute)
- Filter by operation type
- Date range filtering
- Query logs with <500ms response

#### US-9.3: Activity Visualization (Est: 3 pts)
**As a user**, I can visualize activity over time.

**Acceptance Criteria**:
- Timeline view of changes
- Heatmap of activity periods
- Most active users/nodes
- Change velocity metrics

#### US-9.4: Audit & Compliance (Est: 3 pts)
**As an admin**, I can export audit logs for compliance.

**Acceptance Criteria**:
- Export audit logs to CSV/JSON
- Immutable log storage
- Retention policies
- Admin-level access control
- Logs retained per retention policy

### Functional Requirements

**FR-LOG-001**: System shall log all mutations (create/update/delete)
**FR-LOG-002**: System shall include user, timestamp, payload in logs
**FR-LOG-003**: System shall provide activity log queries
**FR-LOG-004**: System shall visualize activity with timeline and heatmaps
**FR-LOG-005**: System shall export logs to CSV/JSON
**FR-LOG-006**: System shall enforce immutable log storage
**FR-LOG-007**: System shall support configurable retention policies

### Non-Functional Requirements

**NFR-LOG-001**: Log queries complete in <500ms (Performance)
**NFR-LOG-002**: Logs shall be immutable and tamper-proof (Security)
**NFR-LOG-003**: System shall support 1M+ log entries (Scalability)
**NFR-LOG-004**: Log export completes in <10 seconds for 10k entries (Performance)

---

## 🔐 **Epic 10: Permissions & Access Control**

**Goal**: Implement role-based permissions to control who sees and edits what.

**Priority**: P0 (Must Have - MVP Phase 1)

**Features Included**:
- Feature #10: User System
- Feature #15: Privileges Configuration

### User Stories

#### US-10.1: User Roles (Est: 2 pts)
**As an admin**, guests cannot enter Edit/Configure modes; activated users can.

**Acceptance Criteria**:
- Guest: Read-only access
- Member: Create/edit own nodes
- Editor: Edit any node
- Admin: Full system access
- Custom roles: Fine-grained permissions
- Mode-switch API returns 403 for unauthorized
- UI hides restricted buttons

#### US-10.2: Mode-Based Access (Est: 2 pts)
**As a system**, I enforce mode-based permissions.

**Acceptance Criteria**:
- Utilization Mode: Available to all
- Setup Mode: Editors and above
- Configure Mode: Admins only
- Temporary Visible Mode: Permission-aware
- Mode switching enforced at API level

#### US-10.3: Object-Level Permissions (Est: 3 pts)
**As a Professional user**, I can set permissions on nodes and contexts.

**Acceptance Criteria**:
- Node-level: Owner, editors, viewers
- Context-level: Inherited permissions
- VizView-level: Shared vs private
- Attribute-level: Who can apply
- Permission changes take effect immediately

#### US-10.4: Permission Management UI (Est: 3 pts)
**As an admin**, I can create/edit roles and permissions.

**Acceptance Criteria**:
- View current permissions
- Grant/revoke access
- Inheritance visualization
- Audit access changes
- Admin endpoints exist
- Support up to 1000 permission rules per object
- Audit trail of permission changes

### Functional Requirements

**FR-PERM-001**: System shall support 4 default roles (Guest, Member, Editor, Admin)
**FR-PERM-002**: System shall support custom roles with fine-grained permissions
**FR-PERM-003**: System shall enforce mode-based access control
**FR-PERM-004**: System shall support object-level permissions (node, context, VizView)
**FR-PERM-005**: System shall provide permission management UI
**FR-PERM-006**: System shall audit all permission changes
**FR-PERM-007**: System shall support permission inheritance

### Non-Functional Requirements

**NFR-PERM-001**: Permission checks complete in <50ms (Performance)
**NFR-PERM-002**: Permissions enforced at API level, not just UI (Security)
**NFR-PERM-003**: Permission changes apply immediately (Consistency)
**NFR-PERM-004**: System shall support 10,000+ permission rules (Scalability)

---

## 🤖 **Epic 11: AI-Enhanced Features**

**Goal**: Provide AI assistance to amplify knowledge work.

**Priority**: P1 (Should Have - Phase 2) + P2 (Nice to Have - Phase 3 for advanced)

**Features Included**:
- Feature #22: Scratchup Concrete Capability & Technology Upgrades (AI)

### User Stories

#### US-11.1: Attribute Suggestions (Est: 3 pts)
**As a user**, AI suggests relevant attributes.

**Acceptance Criteria**:
- AI suggests relevant attributes
- Based on node content and context
- Confidence scoring
- Learn from user feedback
- Batch suggestion generation
- Suggestions return within 2 seconds
- Accuracy improves with user feedback

#### US-11.2: Context Matching (Est: 4 pts)
**As a user**, ML suggests best-fit contexts.

**Acceptance Criteria**:
- ML suggests best-fit contexts
- Analyze wiring patterns
- Cluster similar nodes
- Suggest context merges
- Improve over time with usage
- ML context matching accuracy >70%

#### US-11.3: Smart Auto-Fill (Est: 5 pts)
**As a user**, AI can auto-fill visual templates.

**Acceptance Criteria**:
- Auto-fill visual templates (mindmaps)
- Structured document generation
- Code/diagram generation
- Content summarization
- Relationship inference

#### US-11.4: Natural Language Operations (Est: 5 pts)
**As a user**, I can create nodes via natural language.

**Acceptance Criteria**:
- Create nodes via natural language
- Query knowledge base conversationally
- Generate VizViews from descriptions
- Bulk operations via commands
- Privacy-preserving (opt-in for ML)
- Support both cloud and local AI models

### Functional Requirements

**FR-AI-001**: System shall suggest attributes using AI/ML
**FR-AI-002**: System shall suggest contexts based on wiring patterns
**FR-AI-003**: System shall auto-fill visual templates
**FR-AI-004**: System shall support natural language operations
**FR-AI-005**: System shall learn from user feedback
**FR-AI-006**: System shall support both cloud and local AI models
**FR-AI-007**: System shall provide opt-in for ML features

### Non-Functional Requirements

**NFR-AI-001**: AI suggestions return within 2 seconds (Performance)
**NFR-AI-002**: ML accuracy >70% for context matching (Accuracy)
**NFR-AI-003**: AI operations shall be logged separately (Auditability)
**NFR-AI-004**: System shall preserve privacy for opt-out users (Privacy)

---

## 📤 **Epic 12: Import, Export & Integration**

**Goal**: Enable users to import/export data to integrate with their workflow.

**Priority**: P2 (Nice to Have - Phase 3)

**Features Included**:
- Feature #25: Automation (n8n)
- Feature #24: Engineering Requirements (API)

### User Stories

#### US-12.1: Import Sources (Est: 5 pts)
**As a user**, I can import data from multiple sources.

**Acceptance Criteria**:
- Markdown files (Obsidian, Notion)
- CSV/Excel data
- Mind maps (XMind, FreeMind)
- Graph data (GraphML, JSON)
- Bulk folder import
- Handle imports of 10k+ files
- Import preserves structure and metadata

#### US-12.2: Export Formats (Est: 4 pts)
**As a user**, I can export to multiple formats.

**Acceptance Criteria**:
- Markdown with frontmatter
- PDF with graph visualizations
- JSON (full structure)
- GraphML for external tools
- HTML static site
- Export includes all relationships

#### US-12.3: Import Mapping (Est: 4 pts)
**As a user**, I can map imported data to contexts and nodes.

**Acceptance Criteria**:
- Map file structure to contexts
- Detect backlinks and create wires
- Preserve metadata
- Duplication handling during import
- Progress indicator for large imports

#### US-12.4: API & Webhooks (Est: 5 pts)
**As a developer**, I can integrate via REST API and webhooks.

**Acceptance Criteria**:
- REST API for all operations
- GraphQL for flexible queries
- Webhooks for external integrations
- OAuth2 authentication
- Rate limiting and quotas
- API follows OpenAPI 3.0 spec
- Webhooks deliver within 5 seconds

### Functional Requirements

**FR-INT-001**: System shall import from Markdown, CSV, Mind maps, GraphML
**FR-INT-002**: System shall export to Markdown, PDF, JSON, GraphML, HTML
**FR-INT-003**: System shall provide import mapping interface
**FR-INT-004**: System shall detect and create wires from backlinks
**FR-INT-005**: System shall provide REST API for all operations
**FR-INT-006**: System shall provide GraphQL API
**FR-INT-007**: System shall support webhooks for integrations
**FR-INT-008**: System shall use OAuth2 for authentication
**FR-INT-009**: System shall enforce rate limiting

### Non-Functional Requirements

**NFR-INT-001**: Import completes in <10 seconds for 1000 files (Performance)
**NFR-INT-002**: Export completes in <5 seconds for 1000 nodes (Performance)
**NFR-INT-003**: API follows OpenAPI 3.0 specification (Standards)
**NFR-INT-004**: Webhooks deliver within 5 seconds (Reliability)
**NFR-INT-005**: System shall handle 10k+ file imports (Scalability)

---

## 🔀 **Epic 13: Async Communication**

**Goal**: Enable structured asynchronous question-answer sessions to reduce meetings and gather information efficiently.

**Priority**: P1 (Should Have - Phase 2)

**Features Included**:
- Feature #13: Async Communication Features

**Implementation Approach:**

Async communication sessions are built using nodes and attributes:
- **Session** = context node with `node_type = 'context'` and metadata `{session_type: 'async_communication'}`
- **Questions** = child nodes within session context, ordered by `sort_order` in metadata
- **Responses** = attribute relationships linking respondent to question node with response data in properties
- **Conditional branching** = conditional nodes (existing `node_type = 'conditional'`) that determine next question

**Database Support:** Uses existing `nodes`, `attributes`, and `conditionals` tables. No new tables needed.

### User Stories

#### US-13.1: Manual Async Session Creation (Est: 5 pts)
**As a user**, I can create a sequence of questions manually.

**Acceptance Criteria**:
- Create session as context node
- Add question nodes as children
- Define conditional branching via conditional nodes
- Set SLA/OLA timing in question metadata
- Track external events, time events, internal conditions
- Session creation <5 minutes for simple sequences

#### US-13.2: Async Communication Context Awareness (Est: 3 pts)
**As a stakeholder user**, I am provided with context before adding input.

**Acceptance Criteria**:
- Display background context nodes
- Show related nodes/contexts
- Display previous interaction history
- Provide help text and guidance
- Context loads immediately

### Functional Requirements

**FR-ASYNC-001**: System shall create async sessions as specialized context nodes
**FR-ASYNC-002**: System shall support conditional question branching via conditional nodes
**FR-ASYNC-003**: System shall track SLA/OLA in question node metadata
**FR-ASYNC-004**: System shall link responses via attributes

### Non-Functional Requirements

**NFR-ASYNC-001**: Session creation completes in <5 minutes (Usability)
**NFR-ASYNC-002**: Context loads immediately (Performance)

---

## 🔔 **Epic 14: Notifications**

**Goal**: Notify users about interactions and updates through multiple channels.

**Priority**: P1 (Should Have - Phase 2)

**Features Included**:
- Feature #14: Notifications

**Implementation Approach:**

**Option A (Recommended):** Notifications as specialized nodes
- **Notification** = node with `node_type = 'notification'`
- **Target user** = attribute relationship to user
- **Related entity** = attribute relationship to source node
- **Channels** = array in metadata `{channels: ['email', 'slack', 'whatsapp']}`
- **Status** = metadata field `{status: 'pending'|'sent'|'read'|'escalated'}`

**Option B:** Separate notifications table (if high volume requires optimization)

### User Stories

#### US-14.1: Attached Parties Notifications (Est: 3 pts)
**As a user**, I receive notifications about interactions I'm attached to.

**Acceptance Criteria**:
- CC in interaction notifications
- Following/watching notifications
- Multiple channel preferences
- Escalation to other channels if missed

#### US-14.2: Async Communication Notifications (Est: 2 pts)
**As a receiver**, I get notifications for new question threads.

**Acceptance Criteria**:
- Email, Slack, WhatsApp notifications
- Clickable link to platform
- Notification preferences
- Batching options

### Functional Requirements

**FR-NOTIF-001**: System shall send notifications via email, Slack, WhatsApp
**FR-NOTIF-002**: System shall support notification preferences per user
**FR-NOTIF-003**: System shall escalate to alternate channels if missed
**FR-NOTIF-004**: System shall provide clickable deep links to content

### Non-Functional Requirements

**NFR-NOTIF-001**: Notifications delivered within 30 seconds (Performance)
**NFR-NOTIF-002**: Escalation triggers after user-defined timeout (Reliability)

---

## ⏱️ **Epic 17: Timelining Information**

**Goal**: Arrange and filter information chronologically.

**Priority**: P1 (Should Have - Phase 2)

**Features Included**:
- Feature #17: Timelining Information

**Implementation Approach:**

Uses existing timestamp fields and metadata:
- **Chronological arrangement** = ORDER BY created_at, updated_at, or custom date in metadata
- **Time dimensions** = attributes with `attribute_type = 'time_dimension'`
- **Start/end times** = stored in metadata `{time_range: {start: '...', end: '...'}}`
- **Events** = nodes with metadata `{event_timestamp: '...', event_type: '...'}`

**Database Support:** Existing `created_at`, `updated_at` fields + JSONB metadata. No new tables.

### User Stories

#### US-17.1: Arrange Nodes Chronologically (Est: 3 pts)
**As a user**, I can arrange context nodes chronologically.

**Acceptance Criteria**:
- Chronological node arrangement
- Define chronological parameters
- Time-based node ordering
- Automatic time stamping
- Manual time adjustment

#### US-17.2: Time Dimension Management (Est: 3 pts)
**As a user**, I can define time dimensions with start, end, and events.

**Acceptance Criteria**:
- Define time dimension
- Set start and end times
- Create time events
- Event markers
- Time dimension visualization

### Functional Requirements

**FR-TIME-001**: System shall arrange nodes chronologically via timestamps
**FR-TIME-002**: System shall support time dimensions as specialized attributes
**FR-TIME-003**: System shall store event data in node metadata
**FR-TIME-004**: System shall filter by date ranges

---

## 💬 **Epic 18: Contextual Thread**

**Goal**: Create threaded discussions on focal nodes.

**Priority**: P2 (Nice to Have - Phase 3)

**Features Included**:
- Feature #18: Create Contextual Thread

**Implementation Approach:**

Threads are built using existing node relationships:
- **Thread** = sequence of child nodes linked via `attribute_type = 'thread_reply'`
- **Focal node** = parent node being discussed
- **Thread nodes** = child nodes with `metadata.thread_level` indicating depth
- **Multi-dimensional threads** = thread on specific node version via `attribute.properties.version_id`

**Database Support:** Existing `nodes` and `attributes` tables. Thread = relationship pattern.

### User Stories

#### US-18.1: Create Symbiotic Thread (Est: 3 pts)
**As a user**, I can create threaded discussions on focal nodes.

**Acceptance Criteria**:
- Create thread on focal node
- Sequence of reply nodes
- Thread visualization (2D view)
- Thread navigation

#### US-18.2: Multi-Dimensional Threads (Est: 4 pts)
**As a user**, I can create threads on different dimensions.

**Acceptance Criteria**:
- Node-level thread
- Version-specific threads
- Unlimited thread depth
- Thread dimension management

### Functional Requirements

**FR-THREAD-001**: System shall create threads via node relationships
**FR-THREAD-002**: System shall support unlimited thread depth
**FR-THREAD-003**: System shall link threads to specific node versions

---

## 🧬 **Epic 20: Essential Types**

**Goal**: Enable users to create custom types for nodes, contexts, and attributes.

**Priority**: P1 (Should Have - Phase 2)

**Features Included**:
- Feature #20: Creating Essential Types/Element

**Implementation Approach:**

**Type Definition Strategy (using metadata, NOT schema changes):**

Custom types are stored as metadata, NOT as new `node_type` enum values (which would require schema migrations).

```sql
-- Example: Custom node type
node_type = 'node'  -- Base type stays generic
metadata: {
  custom_type: 'product_feature',
  type_schema: {
    required_fields: ['priority', 'status'],
    allowed_attributes: ['depends_on', 'blocks'],
    validation_rules: {...}
  }
}

-- Example: Custom context type
node_type = 'context'
metadata: {
  custom_type: 'product_roadmap',
  structure_template: {...},
  child_types_allowed: ['product_feature', 'milestone']
}

-- Example: Custom attribute type
attribute_type = 'custom'
properties: {
  custom_attribute_type: 'technical_dependency',
  validation: {...},
  display_rules: {...}
}
```

**Benefits:**
- No database schema changes needed
- Users can create unlimited custom types
- Types are flexible and evolvable
- Validation happens at application layer

### User Stories

#### US-20.1: Create Node Type (Est: 3 pts)
**As a professional user**, I can create custom node types.

**Acceptance Criteria**:
- Define new node type in metadata
- Set type properties and validation rules
- Define type behaviors
- Node type templates

#### US-20.2: Create Context Type (Est: 3 pts)
**As a professional user**, I can create custom context types.

**Acceptance Criteria**:
- Define context type affecting structure
- Pattern affects attributes
- Pattern affects visualization
- Context type templates

#### US-20.3: Create Attribute Types (Est: 3 pts)
**As a professional user**, I can create custom attribute types.

**Acceptance Criteria**:
- Define attribute type
- Attribute properties and validation
- Attribute behaviors

### Functional Requirements

**FR-TYPE-001**: System shall store custom types in node/attribute metadata
**FR-TYPE-002**: System shall validate data against custom type schemas
**FR-TYPE-003**: System shall support type inheritance
**FR-TYPE-004**: System shall apply custom types without schema migrations

### Non-Functional Requirements

**NFR-TYPE-001**: Type validation completes in <100ms (Performance)
**NFR-TYPE-002**: System shall support 1000+ custom types (Scalability)

---

## 📊 **Epic 21: Node Based Analytics**

**Goal**: Provide analytics built on the node architecture.

**Priority**: P2 (Nice to Have - Phase 3)

**Features Included**:
- Feature #21: Node Based Analytics

**Implementation Approach:**

Analytics are aggregations over existing node/attribute data:
- **Activity metrics** = COUNT, SUM aggregations on `activity_logs` table
- **Relationship analytics** = Graph algorithms on `attributes` relationships
- **Usage patterns** = Time-series analysis of node access
- **Trend visualization** = Frontend charting of aggregated data

**Database Support:** Uses existing tables + aggregation queries. Consider materialized views for performance.

### User Stories

#### US-21.1: Node-Based Analytics (Est: 4 pts)
**As a user**, I can view node-based analytics.

**Acceptance Criteria**:
- Analytics built on node architecture
- Node activity metrics
- Relationship analytics
- Usage patterns
- Trend visualization

#### US-21.2: Activity Heatmaps (Est: 3 pts)
**As a user**, I can view activity heatmaps.

**Acceptance Criteria**:
- Heatmap visualization
- Time-based activity clustering
- User/node activity heatmaps
- Interactive exploration

### Functional Requirements

**FR-ANALYTICS-001**: System shall aggregate analytics from node/attribute data
**FR-ANALYTICS-002**: System shall provide graph analytics on relationships
**FR-ANALYTICS-003**: System shall support time-series analysis
**FR-ANALYTICS-004**: System shall cache analytics results

### Non-Functional Requirements

**NFR-ANALYTICS-001**: Analytics queries complete in <3 seconds (Performance)
**NFR-ANALYTICS-002**: Analytics refresh every 5 minutes (Freshness)

---

## 🌳 **Epic 9: Cord (Dimensions)**

**Goal**: Enable multi-dimensional context organization (Parties, Process Lifecycle, Missions, Time, Space).

**Priority**: P1 (Should Have - Phase 2)

**Features Included**:
- Feature #9: Cord (Dimensions)

**Implementation Approach:**

Dimensions are specialized attributes:
- **Dimension types** = `attribute_type` values: `'dimension_party'`, `'dimension_lifecycle'`, `'dimension_mission'`, `'dimension_time'`, `'dimension_space'`
- **Multi-dimensional filtering** = Query nodes by multiple dimension attributes simultaneously
- **Space as scope** = Dimension defines viewing perspective, not data container (no duplication)

```sql
-- Example: Add party dimension to node
INSERT INTO attributes (source_node_id, target_node_id, attribute_type, properties)
VALUES (
  :context_id,
  :node_id,
  'dimension_party',
  '{"party_role": "stakeholder", "party_id": "uuid-123"}'::jsonb
);

-- Example: Filter by multiple dimensions
SELECT n.* FROM nodes n
JOIN attributes a1 ON a1.target_node_id = n.id AND a1.attribute_type = 'dimension_party'
JOIN attributes a2 ON a2.target_node_id = n.id AND a2.attribute_type = 'dimension_lifecycle'
WHERE a1.properties->>'party_role' = 'stakeholder'
  AND a2.properties->>'phase' = 'growth';
```

**Database Support:** Existing `attributes` table. No new tables needed.

### User Stories

#### US-9.1: Space as Scope (Est: 5 pts)
**As a user**, I can use spaces as scopes to view information from different angles.

**Acceptance Criteria**:
- Space = viewing scope, not container
- Cross-project node sharing
- Contextual enrichment per space
- No data duplication
- Same node, different dimensional context

#### US-9.2: Parties Dimension (Est: 3 pts)
**As a user**, I can track stakeholder and participant dimensions.

**Acceptance Criteria**:
- Define parties dimension via attributes
- Track stakeholders and participants
- Party-based filtering
- Party relationship visualization

#### US-9.3: Process Lifecycle Dimension (Est: 3 pts)
**As a user**, I can track process lifecycle stages.

**Acceptance Criteria**:
- Track emergence, growth, maturity, decline phases
- Lifecycle automation
- Philosophical lifecycle perspective

#### US-9.4: Missions Dimension (Est: 3 pts)
**As a user**, I can track goal-oriented dimensions.

**Acceptance Criteria**:
- Define missions/goals dimension
- Track goal progress
- Goal-based filtering
- Mission visualization

### Functional Requirements

**FR-CORD-001**: System shall support dimensional attributes (party, lifecycle, mission, time, space)
**FR-CORD-002**: System shall filter nodes by multiple dimensions simultaneously
**FR-CORD-003**: System shall treat dimensions as viewing perspectives, not data containers
**FR-CORD-004**: System shall prevent data duplication across dimensions

### Non-Functional Requirements

**NFR-CORD-001**: Multi-dimensional queries complete in <500ms (Performance)
**NFR-CORD-002**: System shall support 5+ active dimensions per context (Scalability)

---

## 🎨 **Cross-Epic Themes**

These themes span multiple epics and require coordinated implementation:

### **Theme 1: State Management**
**Epics Involved**: Epic 2 (Block states), Epic 3 (Wire states), Epic 6 (VizView states), Epic 10 (Mode states)

**Requirements**:
- Implement state pattern in JavaScript
- Connect with Vue.js frontend
- State machine per interactive element
- Animation transitions <100ms
- Consistent state behavior across all features

**Technical Dependencies**:
- Study and implement state pattern in JavaScript
- Vue.js Vuex or Pinia for state management
- Frontend state synchronization strategy

---

### **Theme 2: Emergence & Intelligence**
**Epics Involved**: Epic 4 (Attribute suggestions), Epic 5 (Context emergence), Epic 8 (Template recommendations), Epic 11 (AI features)

**Requirements**:
- ML models for pattern recognition
- Confidence scoring framework
- User feedback loop for learning
- Batch processing for efficiency
- Privacy-preserving ML (opt-in)

**Technical Dependencies**:
- ML/AI infrastructure (cloud or local)
- Training data collection and labeling
- Model versioning and deployment

---

### **Theme 3: Performance**
**Epics Involved**: Epic 1 (Bulk operations), Epic 3 (Bulk wiring), Epic 4 (Bulk attributes), Epic 6 (VizView rendering), Epic 7 (Search speed), Epic 12 (Import/export)

**Requirements**:
- Progressive loading and virtual rendering
- Efficient graph algorithms
- Optimized database queries
- Caching strategies
- Background processing for long operations

**Performance Targets**:
- VizView: >20 FPS for 2k nodes, 4k edges
- Search: <1 second for 100k nodes
- Mode switching: <2 seconds
- Bulk operations: <5 seconds for 100 nodes
- Import: <10 seconds for 1000 files

---

### **Theme 4: Living Information**
**Epics Involved**: Epic 1 (Versioning), Epic 3 (Dynamic wiring), Epic 4 (Existence semantics), Epic 5 (Multi-context "super position")

**Requirements**:
- Information maintains abstract form
- Nodes self-describe architecture
- Contexts emerge from patterns
- Neuroplasticity-inspired adaptation
- "Like powder" - malleable and flexible

**Philosophical Foundation**:
- Architecture-less architecture
- Information as living entity
- Zero breaking changes
- Continuous adaptation

---

## 📋 **Feature Priority Matrix**

| Epic | Priority | Phase | Complexity | Story Points |
|------|----------|-------|------------|--------------|
| Epic 1: Node Lifecycle | P0 | Phase 1 | High | 14 |
| Epic 3: Wiring Networks | P0 | Phase 1 | Medium | 13 |
| Epic 4: Attributes | P0 | Phase 1 | High | 19 |
| Epic 5: Contexts (Manual) | P0 | Phase 1 | Medium | 12 |
| Epic 6: VizViews (Basic) | P0 | Phase 1 | Very High | 17 |
| Epic 7: Search | P0 | Phase 1 | Medium | 12 |
| Epic 10: Permissions | P0 | Phase 1 | Medium | 10 |
| **Phase 1 Total** | | | | **97 pts** |
| Epic 2: Document Blocks | P1 | Phase 2 | Medium | 13 |
| Epic 8: Templates | P1 | Phase 2 | High | 14 |
| Epic 9: Activity Logs | P1 | Phase 2 | Low | 11 |
| Epic 11: AI Suggestions | P1 | Phase 2 | High | 12 |
| Epic 5: Contexts (ML) | P1 | Phase 2 | Medium | 6 |
| **Phase 2 Total** | | | | **56 pts** |
| Epic 6: VizViews (Advanced) | P2 | Phase 3 | High | 13 |
| Epic 11: AI Advanced | P2 | Phase 3 | Very High | 10 |
| Epic 12: Import/Export | P2 | Phase 3 | High | 18 |
| Epic 4: Attributes (Advanced) | P2 | Phase 3 | Medium | 8 |
| **Phase 3 Total** | | | | **49 pts** |
| **Grand Total** | | | | **202 pts** |

---

## 🔗 **Alignment with 25 Original Features**

All 25 features from the Notion documentation map to these 12 epics:

| Feature # | Feature Name | Primary Epic | Secondary Epics |
|-----------|-------------|--------------|-----------------|
| 1 | To Be Handled | Epic 1 | - |
| 2 | Application Modes | Epic 6 | Epic 10 |
| 3 | Node System | Epic 1 | Epic 2 |
| 4 | Information Attribution | Epic 4 | Epic 3 |
| 5 | XD Contexts | Epic 5 | - |
| 6 | Nodes Versioning | Epic 1 | - |
| 7 | VizViews | Epic 6 | - |
| 8 | Syntax Anatomy | Epic 4 | - |
| 9 | Cord (Dimensions) | Epic 3 | - |
| 10 | User System | Epic 10 | - |
| 11 | Sharing Context | Epic 5 | Epic 10 |
| 12 | Find Information | Epic 7 | - |
| 13 | Async Communication | Epic 2 | Epic 9 |
| 14 | Notifications | Epic 9 | - |
| 15 | Privileges Configuration | Epic 10 | - |
| 16 | Implement Context Template | Epic 8 | Epic 5 |
| 17 | Timelining Information | Epic 6 | Epic 9 |
| 18 | Create Contextual Thread | Epic 2 | Epic 3 |
| 19 | Create New Context Template | Epic 8 | Epic 5 |
| 20 | Creating Essential Types | Epic 1 | Epic 4 |
| 21 | Node Based Analytics | Epic 9 | - |
| 22 | Technology Upgrades | Epic 11 | - |
| 23 | Pricing Features | Epic 10 | - |
| 24 | Engineering Requirements | Epic 9, 12 | All |
| 25 | Automation (n8n) | Epic 12 | - |

---
# 9. User Mocks

<aside>
💡 Comprehensive UI/UX design required for abstract information visualization. Key screens needed:

**MVP Screens:**
- Onboarding flow explaining architecture-less architecture
- Node creation and editing interface
- Context navigation and creation
- VizView selection and switching (Grid, Graph, Document)
- Application Mode toggle and mode-specific interfaces
- Attribution network visualization
- Search and discovery interface
- Basic sharing and permissions

**Phase 2+ Screens:**
- Async communication session creation (visual logic designer)
- Multi-dimensional context navigator
- Node versioning and time travel interface
- Template marketplace and docking
- Advanced VizViews (Timeline, Board, List, etc.)
- Analytics and insights dashboard

**Design References:**
- Links to Figma/Sketch designs (to be created)
- Hand-drawn wireframes (to be added)
- User flow diagrams for key journeys
- Interaction prototypes for complex features
</aside>

**Note**: Comprehensive UI/UX design work-in-progress. Mocks will be added as design progresses.

---

# 10. Analytics

**Hypothesis**: We believe the architecture-less architecture maintaining maximum abstraction will achieve 10X productivity improvements measurable through iteration speed, change cost reduction, and data-driven decision velocity. *(Measurement infrastructure will be added post-MVP; baseline metrics collected during beta.)*

| **Key Performance Indicator** | **Baseline** | **Target** | **Timeframe** |
| --- | --- | --- | --- |
| **Iteration Cycle Time** | 2 weeks (traditional tools) | 1.5 days (10X improvement) | 6 months from MVP |
| **Time from Data to Decision** | 3 days (current state) | 4 hours (80% reduction) | 9 months from MVP |
| **Change Cost (Time to Modify)** | 2 days development (concrete) | 20 minutes (abstraction) | 6 months from MVP |
| **Template Reuse Setup Time** | 8 hours (from scratch) | 45 minutes (90% reduction) | 12 months |
| **Daily Active Users (DAU)** | 0 (new product) | 50,000 | 18 months |
| **DAU/MAU Ratio** | N/A | 50%+ (daily engagement) | 18 months |
| **Session Completion Rate (Async)** | N/A | 90%+ | 12 months |
| **NPS Score** | N/A | 50+ | 18 months |
| **Template Marketplace Volume** | 0 | 1,000+ templates | 18 months |
| **Template Reuse Rate** | N/A | 100+ uses per template | 18 months |
| **User Tool Consolidation** | 12 tools average | 3 tools (75% reduction) | 24 months |
| **Data-Driven Decision %** | 40% (baseline assumption) | 80%+ | 18 months |
| **"Don't Know" Discovery Rate** | N/A | 3+ insights per user per week | 12 months |
| **Context Switching Time** | N/A | <2 seconds | 6 months |
| **AI Suggestion Acceptance** | N/A | 60%+ | 15 months |
| **User Satisfaction ("Pain-Free")** | N/A | 4.5+/5 | 12 months |

---

# 11. Open Questions

| **Question** | **Answer** | **Outcome** | **Date Answered** |
| --- | --- | --- | --- |
| Can graph database handle attribution network complexity at enterprise scale (millions of nodes)? | Research needed with performance testing | May impact Phase 1 architecture decisions | TBD |
| How do we quantitatively measure the 10X/100X productivity claims? | Define specific metrics: iteration time, change cost, decision velocity | Critical for market validation | TBD |
| What level of AI integration is required for MVP vs. "nice to have"? | Core: attribution suggestions, search; Enhanced: session generation, template population | Affects Phase 2 vs. Phase 3 planning | TBD |
| Can visualization conflicts be mathematically resolved as mentioned in Section 2.0? | Requires research team collaboration | Blocks some advanced scoped view features | TBD |
| How do we prevent "Scratchup Abuse/Misuse" while maintaining power? | Application Modes + AI assistance + community guidelines | Critical for user success | In Progress |
| Is the "architecture-less architecture" concept communicable to non-technical users? | Onboarding testing needed | Affects adoption rate significantly | TBD |
| What is the optimal docking mode (Full vs. Semi) default for new users? | User research with beta testers | Impacts template adoption | TBD |
| How do we price the platform (Points vs. Subscription vs. License)? | Market research + competitor analysis + value-based pricing | Affects revenue model | TBD |
| Can "super position" (nodes in multiple contexts) be explained intuitively? | UX design + progressive disclosure + examples | Critical for XD Contexts adoption | TBD |
| What is the minimum viable Template Marketplace for launch? | Define catalog size, quality bar, categories | Affects Phase 3 timeline | TBD |
| How do we handle data migration from concrete tools to ISAAT? | Migration strategy + import tools + documentation | Critical for enterprise adoption | TBD |
| What level of customization should be allowed for VizViews? | Balance power vs. complexity; research needs | Affects platform openness | TBD |

---

# 12. Out of Scope

<aside>
💡 What are we NOT doing as part of this project and why?
</aside>

## Not Building (Explicitly)

1. **Dedicated Concrete Portals**
   - *Why*: Application Modes replace need for separate OKR portal, Story Map portal, etc.
   - *Rationale*: Concrete portals limit UGC and go against abstraction strategy

2. **Separate Contexts Table**
   - *Why*: Contexts ARE nodes with `node_type = 'context'`
   - *Rationale*: Everything-is-a-node architecture maintains simplicity and abstraction
   - *Implementation*: Use `attributes` with `attribute_type = 'contains'` for containment

3. **Separate Templates Table**
   - *Why*: Templates ARE context nodes marked with `is_template = true`
   - *Rationale*: Consistent node-based architecture
   - *Implementation*: Duplicate node → clean content → mark flag

4. **VizViews in MVP**
   - *Why*: Deferred to post-V2.0 (Q3 2026+)
   - *Rationale*: Requires separate `vizviews` table for persistence - out of MVP scope
   - *MVP Alternative*: Basic client-side rendering of node-relationship data

5. **Rigid Predefined Schemas**
   - *Why*: Architecture-less architecture means nodes define their own structure
   - *Rationale*: Schemas create bottlenecks and change costs

6. **Synchronous-First Communication**
   - *Why*: Async communication is strategic focus
   - *Rationale*: Sync meetings create waste; async enables scale and review

7. **Email/Chat Replacement**
   - *Why*: Focused on async structured communication, not messaging
   - *Rationale*: Different use case; avoid feature bloat

8. **Mobile-First Design in MVP**
   - *Why*: Desktop first for complex abstract visualization
   - *Rationale*: Mobile comes in Phase 4 after desktop validation

9. **Real-Time Collaboration (Multiplayer Editing)**
   - *Why*: Deferred to Phase 4
   - *Rationale*: Async-first strategy; technical complexity

10. **Built-In Video/Audio Communication**
    - *Why*: Not core to abstraction value proposition
    - *Rationale*: Integrate with existing tools (Zoom, etc.)

11. **Traditional Project Management Features**
    - *Why*: Abstract system replaces concrete PM tools, not replicates them
    - *Rationale*: Users can build PM templates; not hardcoded

12. **File Storage System**
    - *Why*: Nodes contain information; external files linked, not stored
    - *Rationale*: Not a document management system

13. **Advanced Workflow Automation in Core**
    - *Why*: n8n integration handles complex automation
    - *Rationale*: Focus on abstraction, not workflow engine

14. **Multi-Language Support in MVP**
    - *Why*: English-first, internationalization in Phase 4
    - *Rationale*: Faster MVP delivery

## Deferred to Future Releases

- Advanced real-time collaboration
- Mobile native apps (iOS, Android)
- Desktop native apps (Windows, Mac, Linux)
- Offline mode
- Advanced security features (SSO, SAML, advanced encryption)
- Compliance certifications (SOC 2, HIPAA, etc.)
- White-label/self-hosted options
- Advanced API and developer platform
- Marketplace revenue sharing

## Explicitly Not Our Focus

- Becoming a general-purpose database
- Replacing all productivity tools entirely
- Building a social network
- Creating a no-code platform (we're information abstraction)
- Competing directly with Figma, Notion, ClickUp (we're the layer beneath)

---

# 13. Future Work

| **Future Feature** | **Purpose** | **Priority** | **Timeframe** |
| --- | --- | --- | --- |
| **Real-Time Collaboration (Multiplayer)** | Enable simultaneous editing like Figma | P1 | 18-24 months |
| **Mobile Native Apps** | Extend ISAAT to mobile devices | P1 | 24 months |
| **Desktop Native Apps** | Performance and offline capabilities | P2 | 24-30 months |
| **Advanced AI Features** | Predictive modeling, pattern recognition beyond suggestions | P1 | 18-24 months |
| **100X Performance Validation** | Demonstrate full 100X with AI integration | P0 | 18 months |
| **Time Traveling & Time Multiplication** | Advanced temporal features mentioned in docs | P2 | 24-30 months |
| **Visualization Conflict Resolution** | Mathematical solution for complex visualizations | P1 | 12-18 months (research) |
| **White-Label / Self-Hosted** | Enterprise deployment options | P2 | 30+ months |
| **Advanced Security & Compliance** | SOC 2, HIPAA, enterprise security | P1 | 18-24 months |
| **Internationalization (i18n)** | Multi-language support | P2 | 24-30 months |
| **API & Developer Platform** | Third-party integrations and extensions | P1 | 18-24 months |
| **Marketplace Revenue Sharing** | Enable template creators to monetize | P2 | 24 months |
| **Advanced Analytics & BI** | Deep insights, predictive analytics | P2 | 24-30 months |
| **Offline Mode** | Work without internet connection | P2 | 30+ months |
| **VR/AR Visualization** | 3D visualization of XD contexts | P3 | 36+ months |
| **Blockchain for Attribution** | Immutable attribution tracking | P3 | 36+ months (research) |
| **Scientific Validation Publication** | Peer-reviewed research on abstraction benefits | P1 | 18-24 months |
| **Enterprise Training Program** | Certification, professional services | P2 | 24 months |
| **Industry-Specific Templates** | Healthcare, Finance, Legal, Education verticals | P2 | 24-36 months |
| **Advanced Automation Studio** | Visual automation builder beyond n8n | P2 | 30+ months |
| **Knowledge Graph Export** | Export to standard knowledge graph formats | P2 | 24 months |
| **AI Co-Pilot Mode** | Proactive AI assistant throughout platform | P1 | 24 months |

---

## Document End

**Total Pages**: ~35 (estimated in final format)
**Total Features**: 25
**Total Requirements**: 160+ (Functional + Non-Functional)
**Total User Stories**: 40+
**Documentation Source**: 241 Notion pages, 5 Google Docs, 1 Academic PDF, 7 Images

**Next Steps**:
1. Validate assumptions with research team
2. Create comprehensive UI/UX mocks
3. Finalize technical architecture for Node-Context-Attribute system
4. Begin Phase 1 development (MVP)
5. Recruit beta users for validation
6. Establish metrics tracking infrastructure

---

*This PRD synthesizes comprehensive documentation analysis from multiple specialized agents performing deep thinking on each section. The document represents a foundational blueprint for the ISAAT platform development.*

---

# Appendix D — Prioritized Backlog (Top 25 User Stories for MVP)

Priority order: highest → lower. Each story includes a suggested estimate and acceptance criteria (AC).

---

### 1. Create Node (Core) — Est: 3 pts
**Story**: As a user, I can create a default node with title and markdown body.
**AC**:
- `POST /api/v1/nodes` returns 201 + node_id
- Node appears in DB and in primary context list
- Auto-generate unique slug
- Assign to primary context
- Choose existence type (Essential, Purposed, Functional, Temporary)
- Set node type (default, document, condition, start, end, custom)

---

### 2. Node Versioning — Est: 3 pts
**Story**: As an editor, when I save a node, a new node_version is created.
**AC**:
- `node_versions` row created automatically
- `GET /api/v1/nodes/:id` returns `current_version_id`
- Every save creates new version with change_summary
- View version history timeline
- Compare versions side-by-side
- Rollback to previous version

---

### 3. Archive Node — Est: 2 pts
**Story**: As a user, I can archive/unarchive a node.
**AC**:
- `PATCH /api/v1/nodes/:id/archive` toggles `is_archived`
- Archived nodes excluded from default search but accessible
- Preserve wiring when archived
- Bulk archive operations support up to 100 nodes

---

### 4. Create Wiring (Edge) — Est: 3 pts
**Story**: As a user, I can connect two nodes with a wire and select relation type.
**AC**:
- `POST /api/v1/wires` creates edge
- Select relation type via attribute
- Set direction (one_way, two_way)
- VizView render shows the connection
- Wires stored with source, target, direction, relation_attribute_id

---

### 5. Attribute CRUD — Est: 4 pts
**Story**: As a user, I can create, read, update, and delete attributes with existence information.
**AC**:
- `POST /api/v1/attributes` persists object
- Existence info validated
- Associate with multiple nodes
- Set display type (label, button, tag, block, data_element)
- UI receives attribute_id

---

### 6. Graph VizView Basic — Est: 5 pts
**Story**: As a user, I can open a Graph VizView for a context and pan/zoom nodes.
**AC**:
- `GET /api/v1/vizviews/:id/render` returns layout + metadata
- Client supports pan/zoom smoothly at 60 FPS
- Select/multi-select nodes
- Filter by node type
- Handle 2k nodes, 4k edges at >20 FPS

---

### 7. Document Block Nodes — Est: 4 pts
**Story**: As a user, I can create a document node composed of ordered block-nodes.
**AC**:
- Document node stores ordered list of block IDs
- Each paragraph/section = potential block node
- Rich-text editing with markdown
- Document renders with <200ms for 100 blocks

---

### 8. Extract Block to Node — Est: 3 pts
**Story**: Extract a paragraph into a standalone node preserving backlinks.
**AC**:
- Operation returns new node_id
- Original block replaced by reference/embed
- Creates new node with backlink automatically
- Maintains document flow

---

### 9. Duplicate Detection (Intra-space) — Est: 3 pts
**Story**: Creating a node with identical title+body in same context triggers merge prompt.
**AC**:
- API returns `409 DUPLICATE` with merge suggestions
- Show similarity scores
- Detect duplicates within same context
- Cross-context duplicates = suggest relationships (not error)

---

### 10. Time-Machine Preview — Est: 4 pts
**Story**: Preview node versions on a timeline in a VizView.
**AC**:
- `GET /api/v1/nodes/:id/versions` lists versions
- `GET /api/v1/vizviews/:id/render?version=...` shows snapshot
- View version history timeline
- Compare versions side-by-side

---

### 11. Attribute Suggestion (Rule-Based) — Est: 3 pts
**Story**: System suggests attributes based on shared keywords.
**AC**:
- `GET /api/v1/attributes/suggest?node_id=...` returns ranked list
- Shared context = suggest common attributes
- Confidence scoring
- Suggestions return within 500ms

---

### 12. Context Creation & Suggestion — Est: 3 pts
**Story**: When wiring multiple nodes, system suggests creating a context.
**AC**:
- UI receives suggested contexts with confidence scores
- `POST /api/v1/contexts` creates one
- System suggests context when wiring 3+ nodes
- ML-based context matching with >70% accuracy

---

### 13. Role-Based Mode Access — Est: 2 pts
**Story**: Guests cannot enter Edit/Configure modes; activated users can.
**AC**:
- Mode-switch API returns 403 for unauthorized
- UI hides restricted buttons
- Guest: Read-only access
- Member: Create/edit own nodes
- Editor: Edit any node
- Admin: Full system access

---

### 14. Search Teleportation (Basic) — Est: 4 pts
**Story**: Fuzzy search opens node in its context (teleport).
**AC**:
- `GET /api/v1/search?q=...` returns node + context + VizView entry point
- Search returns results within 1 second
- Fuzzy matching with typo tolerance
- Click result = open in its context
- VizView centers on target node

---

### 15. Wire Hover Metadata — Est: 2 pts
**Story**: Hovering a wire shows tooltip with attribute summary.
**AC**:
- Tooltip shows within 150ms with title + relation_type
- Wire states: Selected / Unselected / Highlighted Selected / Unselected
- State machine per wire (frontend)
- Animation transitions between states (<100ms)

---

### 16. VizView Save/Load — Est: 3 pts
**Story**: Save VizView layout/filters; reopen same layout.
**AC**:
- `POST /api/v1/vizviews` returns id
- `GET /api/v1/vizviews/:id` returns stored config
- Save current layout (positions, zoom, filters)
- Load saved layout within 2 seconds for 2k nodes

---

### 17. Template Semi-Docking (Dry-run) — Est: 4 pts
**Story**: Dock a template in semi mode and see dry-run changes.
**AC**:
- `POST /api/v1/templates/:id/dock?mode=semi` returns `changes_preview`
- Preview shows what will be created
- Estimate impact (N new nodes, M wires)
- Dry-run shows accurate preview
- Confirm or cancel before applying

---

### 18. Node Inspector Panel (UI) — Est: 4 pts
**Story**: Select node and open inspector with versions, backlinks, attributes.
**AC**:
- API provides attributes, backlinks, versions within 200ms (for <200 refs)
- Node inspector panel (side drawer)
- View all incoming wires (backlinks)
- View all outgoing wires
- Filter wires by relation type

---

### 19. Attribute Display Types — Est: 3 pts
**Story**: Attributes render differently (label, button, block).
**AC**:
- VizView renderer respects `display_type`
- Label form: Simple text tag
- Button form: Clickable interaction
- Block form: Full node rendering
- Data element form: Structured data (Jira-style)

---

### 20. Activity Logs Capture — Est: 2 pts
**Story**: All create/update ops logged.
**AC**:
- Event stored in `activity_logs` with user, timestamp, payload
- Log node create/update/delete
- Log attribute create/update/delete
- Log wire create/delete
- Query logs with <500ms response

---

### 21. Bulk Attribute Apply (Tree) — Est: 5 pts
**Story**: Apply attribute to up to 100 nodes with propagation.
**AC**:
- Endpoint returns `applied_count` + per-node status
- Apply attribute to tree of nodes
- Propagate family/system relations
- Preview changes before applying
- Bulk operations complete in <5 seconds for 100 nodes

---

### 22. Backlinks & Context Family Preview — Est: 3 pts
**Story**: Preview where node appears across contexts.
**AC**:
- `GET /api/v1/nodes/:id/backlinks` returns context list
- Node exists in multiple contexts simultaneously ("super position")
- Primary context for default display
- View all contexts node appears in

---

### 23. Permissions CRUD (Admin) — Est: 3 pts
**Story**: Admin can create/edit roles and permissions.
**AC**:
- Admin endpoints exist
- Changes apply to new sessions immediately
- View current permissions
- Grant/revoke access
- Audit trail of permission changes

---

### 24. VizView Performance Test — Est: 5 pts
**Story**: Validate VizView performance at 2k nodes/4k edges.
**AC**:
- >20 FPS for pan/zoom with progressive loading
- Progressive loading for large graphs
- Virtual rendering for off-screen nodes
- Level-of-detail (LOD) rendering
- Performance targets met on standard hardware

---

### 25. Export Snapshot (PDF/Image) — Est: 3 pts
**Story**: Export current VizView to PDF or PNG.
**AC**:
- `POST /api/v1/vizviews/:id/export?format=pdf` returns downloadable file
- Export to PNG/PDF/SVG
- Maintain visual quality
- Include metadata in export

---

## Total Story Points: 87 pts

**MVP Velocity Estimate**: Assuming 2-week sprints with 5-person team:
- Team velocity: ~15-20 pts/sprint
- MVP completion: 4-5 sprints (8-10 weeks)

**Dependencies**:
- Stories 1-3 (Node system) must complete before stories 4, 7-9
- Story 4 (Wiring) must complete before story 15
- Story 5 (Attributes) must complete before stories 11, 19, 21
- Story 6 (VizView) must complete before stories 10, 14, 16, 24, 25

**Critical Path**:
1. Sprint 1: Stories 1, 2, 3, 5, 13 (15 pts) - Foundation
2. Sprint 2: Stories 4, 6, 7 (12 pts) - Core features
3. Sprint 3: Stories 8, 9, 11, 12, 14 (17 pts) - Intelligence
4. Sprint 4: Stories 15, 16, 18, 19, 20 (14 pts) - UX polish
5. Sprint 5: Stories 17, 21, 22, 23, 24, 25 (29 pts) - Advanced features

---
