import {
  compileSemanticDiagramToDrawio,
} from '../compileSemanticDiagramToDrawio';

import type {
  SemanticDiagramModel,
} from '../../types/diagramIntelligence.types';

import {
  extractAndRepairDrawioXml,
  isValidDrawioXml,
} from '../../utils/drawioXml';

function createBaseDiagram(
  overrides:
    Partial<SemanticDiagramModel> = {},
): SemanticDiagramModel {
  return {
    version: '1.0',

    diagramType:
      'system_architecture',

    title:
      'Test Architecture',

    purpose:
      'Validate deterministic Draw.io compilation.',

    audience:
      'mixed_technical',

    nodes: [
      {
        id:
          'client',

        type:
          'actor',

        label:
          'Client',

        importance:
          'primary',
      },

      {
        id:
          'api',

        type:
          'service',

        label:
          'API',

        importance:
          'primary',
      },
    ],

    edges: [
      {
        id:
          'client-to-api',

        sourceId:
          'client',

        targetId:
          'api',

        type:
          'request',

        label:
          'HTTPS',

        direction:
          'forward',
      },
    ],

    groups: [],

    lanes: [],

    boundaries: [],

    layoutIntent: {
      direction:
        'left_to_right',

      hierarchyLevels: [],

      groupOrder: [],

      minimizeCrossings:
        true,

      emphasizePrimaryFlow:
        true,

      density:
        'balanced',

      edgeRouting:
        'orthogonal',

      notes: [],
    },

    preservedConcepts: [],

    omittedConcepts: [],

    assumptions: [],

    ...overrides,
  };
}

describe(
  'compileSemanticDiagramToDrawio',
  () => {
    test(
      'compiles a flat semantic architecture into valid Draw.io XML',
      () => {
        const diagram =
          createBaseDiagram();

        const result =
          compileSemanticDiagramToDrawio(
            diagram,
          );

        expect(
          result.warnings,
        ).toEqual([]);

        expect(
          isValidDrawioXml(
            result.xml,
          ),
        ).toBe(true);

        expect(
          result.xml,
        ).toContain(
          'mujarrad-node-client',
        );

        expect(
          result.xml,
        ).toContain(
          'mujarrad-node-api',
        );

        expect(
          result.xml,
        ).toContain(
          'mujarrad-edge-client-to-api',
        );
      },
    );

    test(
      'compiles grouped nodes using parent-relative geometry',
      () => {
        const diagram =
          createBaseDiagram({
            groups: [
              {
                id:
                  'application-layer',

                label:
                  'Application Layer',

                type:
                  'layer',
              },
            ],

            nodes: [
              {
                id:
                  'api',

                type:
                  'service',

                label:
                  'API',

                groupId:
                  'application-layer',

                importance:
                  'primary',
              },

              {
                id:
                  'worker',

                type:
                  'service',

                label:
                  'Worker',

                groupId:
                  'application-layer',

                importance:
                  'secondary',
              },
            ],

            edges: [
              {
                id:
                  'api-to-worker',

                sourceId:
                  'api',

                targetId:
                  'worker',

                type:
                  'request',

                direction:
                  'forward',
              },
            ],
          });

        const result =
          compileSemanticDiagramToDrawio(
            diagram,
          );

        expect(
          result.warnings,
        ).toEqual([]);

        expect(
          isValidDrawioXml(
            result.xml,
          ),
        ).toBe(true);

        expect(
          result.xml,
        ).toContain(
          'parent="mujarrad-group-application-layer"',
        );
      },
    );

    test(
      'compiles swimlane nodes with lane parents',
      () => {
        const diagram =
          createBaseDiagram({
            diagramType:
              'swimlane',

            nodes: [
              {
                id:
                  'submit-request',

                type:
                  'action',

                label:
                  'Submit Request',

                laneId:
                  'customer',

                importance:
                  'primary',
              },

              {
                id:
                  'review-request',

                type:
                  'action',

                label:
                  'Review Request',

                laneId:
                  'operations',

                importance:
                  'primary',
              },
            ],

            edges: [
              {
                id:
                  'submit-to-review',

                sourceId:
                  'submit-request',

                targetId:
                  'review-request',

                type:
                  'control_flow',

                direction:
                  'forward',
              },
            ],

            lanes: [
              {
                id:
                  'customer',

                label:
                  'Customer',

                order:
                  0,
              },

              {
                id:
                  'operations',

                label:
                  'Operations',

                order:
                  1,
              },
            ],

            layoutIntent: {
              direction:
                'swimlane',

              hierarchyLevels: [],

              groupOrder: [],

              minimizeCrossings:
                true,

              emphasizePrimaryFlow:
                true,

              density:
                'balanced',

              edgeRouting:
                'orthogonal',

              notes: [],
            },
          });

        const result =
          compileSemanticDiagramToDrawio(
            diagram,
          );

        expect(
          result.warnings,
        ).toEqual([]);

        expect(
          isValidDrawioXml(
            result.xml,
          ),
        ).toBe(true);

        expect(
          result.xml,
        ).toContain(
          'parent="mujarrad-lane-customer"',
        );

        expect(
          result.xml,
        ).toContain(
          'parent="mujarrad-lane-operations"',
        );
      },
    );

    test(
      'skips an edge whose endpoint was not rendered',
      () => {
        const diagram =
          createBaseDiagram({
            edges: [
              {
                id:
                  'broken-edge',

                sourceId:
                  'client',

                targetId:
                  'missing-node',

                type:
                  'request',

                direction:
                  'forward',
              },
            ],
          });

        const result =
          compileSemanticDiagramToDrawio(
            diagram,
          );

        expect(
          result.warnings.some(
            (warning) =>
              warning.includes(
                'broken-edge',
              ),
          ),
        ).toBe(true);

        expect(
          result.xml,
        ).not.toContain(
          'mujarrad-edge-broken-edge',
        );

        expect(
          isValidDrawioXml(
            result.xml,
          ),
        ).toBe(true);
      },
    );

    test(
      'survives the existing repair pipeline',
      () => {
        const diagram =
          createBaseDiagram({
            groups: [
              {
                id:
                  'application-layer',

                label:
                  'Application Layer',

                type:
                  'layer',
              },
            ],

            nodes: [
              {
                id:
                  'api',

                type:
                  'service',

                label:
                  'API',

                groupId:
                  'application-layer',

                importance:
                  'primary',
              },

              {
                id:
                  'database',

                type:
                  'database',

                label:
                  'Database',

                groupId:
                  'application-layer',

                importance:
                  'secondary',
              },
            ],

            edges: [
              {
                id:
                  'api-to-database',

                sourceId:
                  'api',

                targetId:
                  'database',

                type:
                  'data_flow',

                direction:
                  'forward',
              },
            ],
          });

        const compiled =
          compileSemanticDiagramToDrawio(
            diagram,
          );

        const repaired =
          extractAndRepairDrawioXml(
            compiled.xml,
          );

        expect(
          repaired.valid,
        ).toBe(true);

        expect(
          isValidDrawioXml(
            repaired.xml,
          ),
        ).toBe(true);

        expect(
          repaired.xml,
        ).toContain(
          'parent="2"',
        );
      },
    );
  },
);
