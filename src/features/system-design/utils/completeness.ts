import type {
  CompletenessReport,
  SystemUnderstanding,
} from '../types/layer1.types';

export interface DeterministicReadinessResult {
  overallScore: number;
  readyForDiagram: boolean;
}

function cappedCount(
  count: number,
  maximumPoints: number,
  fullScoreCount: number,
): number {
  if (count <= 0) {
    return 0;
  }

  return Math.min(
    maximumPoints,
    Math.round(
      maximumPoints *
        Math.min(
          1,
          count / fullScoreCount,
        ),
    ),
  );
}

function workflowDepth(
  understanding: SystemUnderstanding,
): number {
  return understanding.workflows.reduce(
    (
      total,
      workflow,
    ) =>
      total +
      workflow.steps.length,
    0,
  );
}

export function calculateDeterministicReadiness(
  understanding: SystemUnderstanding,
  answeredQuestionCount = 0,
): DeterministicReadinessResult {
  let score = 0;

  const hasGoal =
    Boolean(
      understanding.goal.trim(),
    );

  const actorCount =
    understanding.primaryUsers.length +
    understanding.secondaryUsers.length +
    understanding.roles.length;

  const workflowCount =
    understanding.workflows.length;

  const totalWorkflowSteps =
    workflowDepth(
      understanding,
    );

  const entityCount =
    understanding.entities.length;

  const ruleCount =
    understanding.businessRules.length +
    understanding.decisionLogic.length +
    understanding.validationRules.length;

  const integrationCount =
    understanding.integrations.length;

  const securityCount =
    understanding.security.length +
    understanding.permissions.length;

  const failureCount =
    understanding.errorCases.length +
    understanding.edgeCases.length;

  const inputOutputCount =
    understanding.inputs.length +
    understanding.outputs.length;

  // Purpose: 10 points.
  if (hasGoal) {
    score += 10;
  }

  // Actors and roles: 10 points.
  score += cappedCount(
    actorCount,
    10,
    4,
  );

  // Main workflows: 15 points.
  score += cappedCount(
    workflowCount,
    15,
    3,
  );

  // Workflow detail and traceability: 10 points.
  score += cappedCount(
    totalWorkflowSteps,
    10,
    10,
  );

  // Core entities and data: 10 points.
  score += cappedCount(
    entityCount,
    10,
    6,
  );

  // Rules and decisions: 10 points.
  score += cappedCount(
    ruleCount,
    10,
    6,
  );

  // Integrations: 10 points.
  score += cappedCount(
    integrationCount,
    10,
    4,
  );

  // Security and permissions: 5 points.
  score += cappedCount(
    securityCount,
    5,
    4,
  );

  // Failure and edge-case behavior: 5 points.
  score += cappedCount(
    failureCount,
    5,
    4,
  );

  // Inputs and outputs: 5 points.
  score += cappedCount(
    inputOutputCount,
    5,
    4,
  );

  // Clarification evidence: 5 points.
  // This ensures accumulated answered questions are reflected
  // without allowing question count to dominate readiness.
  score += Math.min(
    5,
    answeredQuestionCount,
  );

  // Confidence contribution: 5 points.
  score += Math.round(
    Math.min(
      1,
      Math.max(
        0,
        understanding.confidence,
      ),
    ) * 5,
  );

  const overallScore =
    Math.min(
      100,
      Math.max(
        0,
        score,
      ),
    );

  const hasMinimumArchitecture =
    hasGoal &&
    actorCount > 0 &&
    workflowCount > 0;

  return {
    overallScore,
    readyForDiagram:
      overallScore >= 61 &&
      hasMinimumArchitecture,
  };
}

export function applyDeterministicReadiness(
  understanding: SystemUnderstanding,
  report: CompletenessReport,
  answeredQuestionCount = 0,
): CompletenessReport {
  const readiness =
    calculateDeterministicReadiness(
      understanding,
      answeredQuestionCount,
    );

  return {
    ...report,
    overallScore:
      readiness.overallScore,
    readyForDiagram:
      readiness.readyForDiagram,
  };
}

export function isReadyForDiagram(
  completeness: CompletenessReport | null,
): boolean {
  if (!completeness) {
    return false;
  }

  return completeness.readyForDiagram;
}
