import { BLOCK_TYPES, type BlockType, type CalloutType } from '@/components/blocks/types';

export type TemplateBlockDefinition = {
  type: BlockType;
  content: string;
  checked?: boolean;
  language?: string;
  calloutType?: CalloutType;
};

export type NodeTemplate = {
  id: string;
  name: string;
  category: string;
  description: string;
  bestFor: string;
  semanticType?: string;
  accentColor?: string;
  blocks: TemplateBlockDefinition[];
};

export const NODE_TEMPLATES: NodeTemplate[] = [
  {
    id: 'blank-note',
    name: 'Blank Note',
    category: 'Basic',
    description: 'A clean note structure for general writing.',
    bestFor: 'Quick notes, thoughts, and simple documentation.',
    blocks: [
      {
        type: BLOCK_TYPES.TEXT,
        content: '',
      },
    ],
  },
  {
    id: 'person-profile',
    name: 'Person Profile',
    category: 'People',
    description: 'A structured profile for a person node.',
    bestFor: 'People, contacts, stakeholders, team members, and extracted person entities.',
    semanticType: 'person',
    accentColor: '#3b82f6',
    blocks: [
      {
        type: BLOCK_TYPES.HEADING_1,
        content: 'Overview',
      },
      {
        type: BLOCK_TYPES.TEXT,
        content: 'Write a short summary about this person.',
      },
      {
        type: BLOCK_TYPES.HEADING_2,
        content: 'Key facts',
      },
      {
        type: BLOCK_TYPES.BULLET_LIST,
        content: 'Role:',
      },
      {
        type: BLOCK_TYPES.BULLET_LIST,
        content: 'Organization:',
      },
      {
        type: BLOCK_TYPES.BULLET_LIST,
        content: 'Location:',
      },
      {
        type: BLOCK_TYPES.HEADING_2,
        content: 'Related notes',
      },
      {
        type: BLOCK_TYPES.TEXT,
        content: '',
      },
    ],
  },
  {
    id: 'project-brief',
    name: 'Project Brief',
    category: 'Project',
    description: 'A structured template for describing a project or initiative.',
    bestFor: 'Projects, features, initiatives, planning, and execution notes.',
    semanticType: 'project',
    accentColor: '#8b5cf6',
    blocks: [
      {
        type: BLOCK_TYPES.HEADING_1,
        content: 'Project summary',
      },
      {
        type: BLOCK_TYPES.TEXT,
        content: 'Describe the project in one or two short paragraphs.',
      },
      {
        type: BLOCK_TYPES.HEADING_2,
        content: 'Goals',
      },
      {
        type: BLOCK_TYPES.BULLET_LIST,
        content: 'Goal 1:',
      },
      {
        type: BLOCK_TYPES.BULLET_LIST,
        content: 'Goal 2:',
      },
      {
        type: BLOCK_TYPES.HEADING_2,
        content: 'Status',
      },
      {
        type: BLOCK_TYPES.CALLOUT,
        content: 'Current status, blockers, or next decision.',
        calloutType: 'info',
      },
      {
        type: BLOCK_TYPES.HEADING_2,
        content: 'Tasks',
      },
      {
        type: BLOCK_TYPES.TODO,
        content: 'Define next action',
        checked: false,
      },
      {
        type: BLOCK_TYPES.TODO,
        content: 'Assign owner',
        checked: false,
      },
    ],
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    category: 'Work',
    description: 'A practical meeting notes structure.',
    bestFor: 'Meetings, workshops, calls, and discussion summaries.',
    semanticType: 'meeting',
    accentColor: '#f97316',
    blocks: [
      {
        type: BLOCK_TYPES.HEADING_1,
        content: 'Meeting summary',
      },
      {
        type: BLOCK_TYPES.TEXT,
        content: 'Write a short summary of the meeting.',
      },
      {
        type: BLOCK_TYPES.HEADING_2,
        content: 'Attendees',
      },
      {
        type: BLOCK_TYPES.BULLET_LIST,
        content: '',
      },
      {
        type: BLOCK_TYPES.HEADING_2,
        content: 'Discussion points',
      },
      {
        type: BLOCK_TYPES.BULLET_LIST,
        content: '',
      },
      {
        type: BLOCK_TYPES.HEADING_2,
        content: 'Decisions',
      },
      {
        type: BLOCK_TYPES.BULLET_LIST,
        content: '',
      },
      {
        type: BLOCK_TYPES.HEADING_2,
        content: 'Action items',
      },
      {
        type: BLOCK_TYPES.TODO,
        content: 'Follow up on next step',
        checked: false,
      },
    ],
  },
  {
    id: 'research-note',
    name: 'Research Note',
    category: 'Research',
    description: 'A structured research note for claims, sources, and open questions.',
    bestFor: 'Academic notes, source analysis, literature review, and research tracking.',
    semanticType: 'research',
    accentColor: '#10b981',
    blocks: [
      {
        type: BLOCK_TYPES.HEADING_1,
        content: 'Research question',
      },
      {
        type: BLOCK_TYPES.TEXT,
        content: 'Write the main question or claim here.',
      },
      {
        type: BLOCK_TYPES.HEADING_2,
        content: 'Evidence',
      },
      {
        type: BLOCK_TYPES.BULLET_LIST,
        content: 'Evidence point:',
      },
      {
        type: BLOCK_TYPES.HEADING_2,
        content: 'Counter-arguments',
      },
      {
        type: BLOCK_TYPES.QUOTE,
        content: 'Add opposing views or limitations here.',
      },
      {
        type: BLOCK_TYPES.HEADING_2,
        content: 'Open questions',
      },
      {
        type: BLOCK_TYPES.TODO,
        content: 'Verify source or missing fact',
        checked: false,
      },
    ],
  },
  {
    id: 'risk-analysis',
    name: 'Risk Analysis',
    category: 'Analysis',
    description: 'A template for identifying risks, impact, and mitigation.',
    bestFor: 'Risk nodes, assumptions, blockers, and decision analysis.',
    semanticType: 'risk',
    accentColor: '#f43f5e',
    blocks: [
      {
        type: BLOCK_TYPES.HEADING_1,
        content: 'Risk description',
      },
      {
        type: BLOCK_TYPES.TEXT,
        content: 'Describe the risk clearly.',
      },
      {
        type: BLOCK_TYPES.HEADING_2,
        content: 'Impact',
      },
      {
        type: BLOCK_TYPES.CALLOUT,
        content: 'Explain what happens if this risk becomes real.',
        calloutType: 'warning',
      },
      {
        type: BLOCK_TYPES.HEADING_2,
        content: 'Mitigation',
      },
      {
        type: BLOCK_TYPES.TODO,
        content: 'Define mitigation action',
        checked: false,
      },
      {
        type: BLOCK_TYPES.HEADING_2,
        content: 'Owner',
      },
      {
        type: BLOCK_TYPES.TEXT,
        content: '',
      },
    ],
  },
];

export function getNodeTemplateById(templateId: string | null | undefined) {
  if (!templateId) return null;
  return NODE_TEMPLATES.find((template) => template.id === templateId) ?? null;
}

export function getNodeTemplateCategories() {
  return Array.from(new Set(NODE_TEMPLATES.map((template) => template.category)));
}