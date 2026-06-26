import type { Layer1GraphState } from '../types/graph.types';
import type { SystemUnderstanding } from '../types/layer1.types';
import { systemUnderstandingSchema } from '../schemas/layer1.schema';
import { getUnderstandingUpdatePrompt } from '../prompts/understandingUpdatePrompt';
import { callAiProvider } from '../tools/aiProviderTool';
import { createSystemDesignId } from '../utils/id';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asStringArray(value: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(value)) return fallback;

  return value
    .map((item) => {
      if (typeof item === 'string') return item;
      if (isRecord(item)) {
        return asString(item.name) || asString(item.title) || asString(item.description) || asString(item.value);
      }
      return '';
    })
    .filter(Boolean);
}

function asRecordArray(value: unknown): UnknownRecord[] {
  if (!Array.isArray(value)) return [];

  return value.map((item) => {
    if (typeof item === 'string') {
      return { name: item, title: item, description: item, value: item };
    }

    return isRecord(item) ? item : {};
  });
}

function normalizeWorkflows(value: unknown, fallback: SystemUnderstanding['workflows']) {
  if (!Array.isArray(value)) return fallback;

  return asRecordArray(value).map((item, index) => ({
    id: asString(item.id, createSystemDesignId(`workflow-${index}`)),
    title:
      asString(item.title) ||
      asString(item.name) ||
      asString(item.workflow) ||
      asString(item.description, `Workflow ${index + 1}`),
    steps: asStringArray(item.steps, asString(item.description) ? [asString(item.description)] : []),
  }));
}

function normalizeNamedDescriptions<T extends { id: string; name: string; description?: string }>(
  value: unknown,
  fallback: T[],
): T[] {
  if (!Array.isArray(value)) return fallback;

  return asRecordArray(value).map((item, index) => ({
    id: asString(item.id, createSystemDesignId(`item-${index}`)),
    name: asString(item.name) || asString(item.title) || asString(item.value, `Item ${index + 1}`),
    description: asString(item.description) || undefined,
  })) as T[];
}

function normalizeEntities(value: unknown, fallback: SystemUnderstanding['entities']) {
  if (!Array.isArray(value)) return fallback;

  return asRecordArray(value).map((item, index) => ({
    id: asString(item.id, createSystemDesignId(`entity-${index}`)),
    name: asString(item.name) || asString(item.title) || asString(item.value, `Entity ${index + 1}`),
    attributes: asStringArray(item.attributes, []),
  }));
}

function normalizeBusinessRules(value: unknown, fallback: SystemUnderstanding['businessRules']) {
  if (!Array.isArray(value)) return fallback;

  return asRecordArray(value).map((item, index) => ({
    id: asString(item.id, createSystemDesignId(`business-rule-${index}`)),
    rule: asString(item.rule) || asString(item.description) || asString(item.name) || asString(item.value, `Business rule ${index + 1}`),
  }));
}

function normalizeDecisionLogic(value: unknown, fallback: SystemUnderstanding['decisionLogic']) {
  if (!Array.isArray(value)) return fallback;

  return asRecordArray(value).map((item, index) => ({
    id: asString(item.id, createSystemDesignId(`decision-${index}`)),
    condition: asString(item.condition) || asString(item.when) || asString(item.name, `Condition ${index + 1}`),
    outcome: asString(item.outcome) || asString(item.then) || asString(item.result) || asString(item.description, 'Outcome to be clarified'),
  }));
}

function normalizeValidationRules(value: unknown, fallback: SystemUnderstanding['validationRules']) {
  if (!Array.isArray(value)) return fallback;

  return asRecordArray(value).map((item, index) => ({
    id: asString(item.id, createSystemDesignId(`validation-${index}`)),
    field: asString(item.field) || asString(item.name, `Field ${index + 1}`),
    rule: asString(item.rule) || asString(item.description) || asString(item.value, 'Validation rule to be clarified'),
  }));
}

function normalizeEdgeCases(value: unknown, fallback: SystemUnderstanding['edgeCases']) {
  if (!Array.isArray(value)) return fallback;

  return asRecordArray(value).map((item, index) => ({
    id: asString(item.id, createSystemDesignId(`edge-case-${index}`)),
    case: asString(item.case) || asString(item.description) || asString(item.name) || asString(item.value, `Edge case ${index + 1}`),
  }));
}

function normalizeErrorCases(value: unknown, fallback: SystemUnderstanding['errorCases']) {
  if (!Array.isArray(value)) return fallback;

  return asRecordArray(value).map((item, index) => ({
    id: asString(item.id, createSystemDesignId(`error-case-${index}`)),
    error: asString(item.error) || asString(item.name) || asString(item.description, `Error case ${index + 1}`),
    handling: asString(item.handling) || asString(item.recovery) || asString(item.solution, 'Handling to be clarified'),
  }));
}

function normalizeIntegrations(value: unknown, fallback: SystemUnderstanding['integrations']) {
  if (!Array.isArray(value)) return fallback;

  return asRecordArray(value).map((item, index) => ({
    id: asString(item.id, createSystemDesignId(`integration-${index}`)),
    name: asString(item.name) || asString(item.title) || asString(item.value, `Integration ${index + 1}`),
    purpose: asString(item.purpose) || asString(item.description, 'Purpose to be clarified'),
  }));
}

function normalizeNotifications(value: unknown, fallback: SystemUnderstanding['notifications']) {
  if (!Array.isArray(value)) return fallback;

  return asRecordArray(value).map((item, index) => ({
    id: asString(item.id, createSystemDesignId(`notification-${index}`)),
    trigger: asString(item.trigger) || asString(item.when) || asString(item.name, `Trigger ${index + 1}`),
    message: asString(item.message) || asString(item.description, 'Message to be clarified'),
  }));
}

function normalizeReporting(value: unknown, fallback: SystemUnderstanding['reporting']) {
  if (!Array.isArray(value)) return fallback;

  return asRecordArray(value).map((item, index) => ({
    id: asString(item.id, createSystemDesignId(`report-${index}`)),
    report: asString(item.report) || asString(item.name) || asString(item.title, `Report ${index + 1}`),
    audience: asString(item.audience) || undefined,
  }));
}

function normalizeSecurity(value: unknown, fallback: SystemUnderstanding['security']) {
  if (!Array.isArray(value)) return fallback;

  return asRecordArray(value).map((item, index) => ({
    id: asString(item.id, createSystemDesignId(`security-${index}`)),
    requirement:
      asString(item.requirement) ||
      asString(item.description) ||
      asString(item.name) ||
      asString(item.value, `Security requirement ${index + 1}`),
  }));
}

function normalizeSystemUnderstanding(
  parsed: unknown,
  previous: SystemUnderstanding,
): SystemUnderstanding {
  const input = isRecord(parsed) ? parsed : {};

  const normalized: SystemUnderstanding = {
    summary: asString(input.summary, previous.summary),
    goal: asString(input.goal, previous.goal),
    primaryUsers: asStringArray(input.primaryUsers, previous.primaryUsers),
    secondaryUsers: asStringArray(input.secondaryUsers, previous.secondaryUsers),
    roles: asStringArray(input.roles, previous.roles),
    permissions: asStringArray(input.permissions, previous.permissions),
    workflows: normalizeWorkflows(input.workflows, previous.workflows),
    alternativeWorkflows: normalizeWorkflows(input.alternativeWorkflows, previous.alternativeWorkflows),
    inputs: normalizeNamedDescriptions(input.inputs, previous.inputs),
    outputs: normalizeNamedDescriptions(input.outputs, previous.outputs),
    entities: normalizeEntities(input.entities, previous.entities),
    businessRules: normalizeBusinessRules(input.businessRules, previous.businessRules),
    decisionLogic: normalizeDecisionLogic(input.decisionLogic, previous.decisionLogic),
    validationRules: normalizeValidationRules(input.validationRules, previous.validationRules),
    edgeCases: normalizeEdgeCases(input.edgeCases, previous.edgeCases),
    errorCases: normalizeErrorCases(input.errorCases, previous.errorCases),
    integrations: normalizeIntegrations(input.integrations, previous.integrations),
    notifications: normalizeNotifications(input.notifications, previous.notifications),
    reporting: normalizeReporting(input.reporting, previous.reporting),
    security: normalizeSecurity(input.security, previous.security),
    openQuestions: asStringArray(input.openQuestions, previous.openQuestions),
    assumptions: asStringArray(input.assumptions, previous.assumptions),
    confidence: Math.min(1, Math.max(0, asNumber(input.confidence, previous.confidence))),
  };

  return systemUnderstandingSchema.parse(normalized);
}

export async function updateUnderstandingNode(
  state: Layer1GraphState,
): Promise<{ understanding: SystemUnderstanding; error?: string }> {
  try {
    const prompt = getUnderstandingUpdatePrompt(state);
    const response = await callAiProvider(
      [{ role: 'user', content: prompt }],
      { responseFormat: 'json_object', temperature: 0.2, maxTokens: 900 },
    );

    const parsedJson = JSON.parse(response) as unknown;
    const understanding = normalizeSystemUnderstanding(parsedJson, state.understanding);

    return { understanding };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown understanding update error.';
    return { understanding: state.understanding, error: errorMessage };
  }
}
