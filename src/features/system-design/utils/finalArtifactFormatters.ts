import { encode } from '@toon-format/toon';
import { stringify as stringifyYaml } from 'yaml';

import type {
  Layer1CanonicalArtifact,
} from '../types/layer1.types';

function markdownList(values: string[]): string {
  if (values.length === 0) {
    return '- None';
  }

  return values.map((value) => `- ${value}`).join('\n');
}

export function toPrettyJson(
  artifact: Layer1CanonicalArtifact,
): string {
  return JSON.stringify(artifact, null, 2);
}

export function toCompactJson(
  artifact: Layer1CanonicalArtifact,
): string {
  return JSON.stringify(artifact);
}

export function toToon(
  artifact: Layer1CanonicalArtifact,
): string {
  return encode(artifact);
}

export function toYaml(
  artifact: Layer1CanonicalArtifact,
): string {
  return stringifyYaml(artifact);
}

export function toMarkdown(
  artifact: Layer1CanonicalArtifact,
): string {
  const understanding = artifact.system.understanding;
  const completeness = artifact.system.completeness;

  const workflows = understanding.workflows.length
    ? understanding.workflows
        .map(
          (workflow) =>
            `### ${workflow.title}\n${workflow.steps
              .map((step, index) => `${index + 1}. ${step}`)
              .join('\n')}`,
        )
        .join('\n\n')
    : 'None documented.';

  const answeredQuestions =
    artifact.clarification.answeredQuestions.length
      ? artifact.clarification.answeredQuestions
          .map(
            (item) =>
              `### ${item.question}\n\n${item.answer}`,
          )
          .join('\n\n')
      : 'None.';

  return `# Final System Specification

## Summary

${artifact.system.summary || 'Not specified.'}

## Goal

${artifact.system.goal || 'Not specified.'}

## Primary Users

${markdownList(understanding.primaryUsers)}

## Secondary Users

${markdownList(understanding.secondaryUsers)}

## Roles

${markdownList(understanding.roles)}

## Permissions

${markdownList(understanding.permissions)}

## Workflows

${workflows}

## Business Rules

${markdownList(
  understanding.businessRules.map((item) => item.rule),
)}

## Decision Logic

${markdownList(
  understanding.decisionLogic.map(
    (item) => `${item.condition} → ${item.outcome}`,
  ),
)}

## Inputs

${markdownList(
  understanding.inputs.map(
    (item) =>
      item.description
        ? `${item.name}: ${item.description}`
        : item.name,
  ),
)}

## Outputs

${markdownList(
  understanding.outputs.map(
    (item) =>
      item.description
        ? `${item.name}: ${item.description}`
        : item.name,
  ),
)}

## Entities

${markdownList(
  understanding.entities.map(
    (item) =>
      `${item.name}: ${item.attributes.join(', ') || 'No attributes specified'}`,
  ),
)}

## Integrations

${markdownList(
  understanding.integrations.map(
    (item) => `${item.name}: ${item.purpose}`,
  ),
)}

## Security Requirements

${markdownList(
  understanding.security.map((item) => item.requirement),
)}

## Edge Cases

${markdownList(
  understanding.edgeCases.map((item) => item.case),
)}

## Error Cases

${markdownList(
  understanding.errorCases.map(
    (item) => `${item.error}: ${item.handling}`,
  ),
)}

## Notifications

${markdownList(
  understanding.notifications.map(
    (item) => `${item.trigger}: ${item.message}`,
  ),
)}

## Reporting

${markdownList(
  understanding.reporting.map(
    (item) =>
      item.audience
        ? `${item.report} — ${item.audience}`
        : item.report,
  ),
)}

## Assumptions

${markdownList(understanding.assumptions)}

## Open Questions

${markdownList(understanding.openQuestions)}

## Clarification Record

${answeredQuestions}

## Completeness

- Score: ${completeness?.overallScore ?? 'Not available'}
- Ready for diagram: ${completeness?.readyForDiagram ?? false}

## Approved Diagram

- Approved: ${artifact.diagram.approved}
- Revisions: ${artifact.diagram.revisionCount}
- Summary: ${artifact.diagram.summary || 'No summary available.'}

The complete approved Draw.io XML is included as a separate artifact.
`;
}

export function toPlainText(
  artifact: Layer1CanonicalArtifact,
): string {
  const understanding = artifact.system.understanding;

  return [
    `SYSTEM SUMMARY: ${artifact.system.summary || 'Not specified.'}`,
    `GOAL: ${artifact.system.goal || 'Not specified.'}`,
    `PRIMARY USERS: ${understanding.primaryUsers.join('; ') || 'None'}`,
    `ROLES: ${understanding.roles.join('; ') || 'None'}`,
    `WORKFLOWS: ${understanding.workflows
      .map(
        (workflow) =>
          `${workflow.title}: ${workflow.steps.join(' -> ')}`,
      )
      .join(' | ') || 'None'}`,
    `BUSINESS RULES: ${understanding.businessRules
      .map((item) => item.rule)
      .join('; ') || 'None'}`,
    `INTEGRATIONS: ${understanding.integrations
      .map((item) => `${item.name}: ${item.purpose}`)
      .join('; ') || 'None'}`,
    `SECURITY: ${understanding.security
      .map((item) => item.requirement)
      .join('; ') || 'None'}`,
    `DIAGRAM SUMMARY: ${artifact.diagram.summary || 'None'}`,
  ].join('\n');
}
