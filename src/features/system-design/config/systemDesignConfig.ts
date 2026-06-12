export const SYSTEM_DESIGN_CONFIG = {
  productName: 'System Design',
  routePath: '/system-builder',

  orchestrator: {
    mode: 'langgraph',
    runtime: 'nextjs-server',
  },

  layers: {
    layer1: {
      id: 'layer-1',
      name: 'Layer 1',
      title: 'System Design',
      status: 'active',
      description:
        'Collect requirements, clarify the system, generate a Markdown specification, create a Draw.io diagram, and export the approved Layer 1 artifact bundle.',
    },
    layer2: {
      id: 'layer-2',
      name: 'Layer 2',
      title: 'Abstract Logic',
      status: 'locked',
      description:
        'Coming soon. Requires the approved Layer 1 artifact bundle: Markdown specification, Draw.io XML, and diagram image.',
    },
    layer3: {
      id: 'layer-3',
      name: 'Layer 3',
      title: 'Code Machine',
      status: 'locked',
      description:
        'Coming soon. Requires future Layer 2 abstract logic output before code generation can start.',
    },
  },

  inputLimits: {
    maxDirectCharacters: 12000,
    maxChunkCharacters: 6000,
    chunkOverlapCharacters: 500,
  },

  exportFiles: {
    markdownSpec: 'final-system-spec.md',
    drawioXml: 'system-diagram.drawio.xml',
    diagramPng: 'system-diagram.png',
    diagramSvg: 'system-diagram.svg',
    diagramSummary: 'system-diagram-summary.md',
  },
} as const;

export type SystemDesignLayerStatus = 'active' | 'locked';

