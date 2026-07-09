import type { Layer1GraphState } from '../types/graph.types';
import type { SystemUnderstanding } from '../types/layer1.types';
import { systemUnderstandingSchema } from '../schemas/layer1.schema';
import { getUnderstandingUpdatePrompt } from '../prompts/understandingUpdatePrompt';
import {
  callAiProviderWithUsage,
  type AiTokenUsage,
} from '../tools/aiProviderTool';
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

function mergeUniqueStrings(
  previous: string[],
  incoming: string[],
): string[] {
  const seen =
    new Set<string>();

  return [
    ...previous,
    ...incoming,
  ].filter((item) => {
    const key =
      item
        .trim()
        .toLowerCase();

    if (
      !key ||
      seen.has(key)
    ) {
      return false;
    }

    seen.add(key);

    return true;
  });
}

function normalizeIdentity(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      ' ',
    )
    .trim();
}

function mergeStructuredItems<
  T extends {
    id: string;
  },
>(
  previous: T[],
  incoming: T[],
  getIdentity: (
    item: T,
  ) => string,
  mergeItem?: (
    previousItem: T,
    incomingItem: T,
  ) => T,
): T[] {
  const merged =
    new Map<string, T>();

  previous.forEach(
    (item) => {
      const key =
        normalizeIdentity(
          getIdentity(item),
        );

      if (key) {
        merged.set(
          key,
          item,
        );
      }
    },
  );

  incoming.forEach(
    (item) => {
      const key =
        normalizeIdentity(
          getIdentity(item),
        );

      if (!key) {
        return;
      }

      const existing =
        merged.get(key);

      if (!existing) {
        merged.set(
          key,
          item,
        );

        return;
      }

      merged.set(
        key,
        mergeItem
          ? mergeItem(
              existing,
              item,
            )
          : {
              ...existing,
              ...item,
              id: existing.id,
            },
      );
    },
  );

  return Array.from(
    merged.values(),
  );
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
    primaryUsers: mergeUniqueStrings(
      previous.primaryUsers,
      asStringArray(input.primaryUsers, []),
    ),
    secondaryUsers: mergeUniqueStrings(
      previous.secondaryUsers,
      asStringArray(input.secondaryUsers, []),
    ),
    roles: mergeUniqueStrings(
      previous.roles,
      asStringArray(input.roles, []),
    ),
    permissions: mergeUniqueStrings(
      previous.permissions,
      asStringArray(input.permissions, []),
    ),
    workflows: mergeStructuredItems(
      previous.workflows,
      normalizeWorkflows(
        input.workflows,
        [],
      ),
      (item) =>
        item.title,
      (
        previousItem,
        incomingItem,
      ) => ({
        ...previousItem,
        ...incomingItem,
        id: previousItem.id,
        steps: mergeUniqueStrings(
          previousItem.steps,
          incomingItem.steps,
        ),
      }),
    ),

    alternativeWorkflows:
      mergeStructuredItems(
        previous.alternativeWorkflows,
        normalizeWorkflows(
          input.alternativeWorkflows,
          [],
        ),
        (item) =>
          item.title,
        (
          previousItem,
          incomingItem,
        ) => ({
          ...previousItem,
          ...incomingItem,
          id: previousItem.id,
          steps: mergeUniqueStrings(
            previousItem.steps,
            incomingItem.steps,
          ),
        }),
      ),

    inputs: mergeStructuredItems(
      previous.inputs,
      normalizeNamedDescriptions(
        input.inputs,
        [],
      ),
      (item) =>
        item.name,
    ),

    outputs: mergeStructuredItems(
      previous.outputs,
      normalizeNamedDescriptions(
        input.outputs,
        [],
      ),
      (item) =>
        item.name,
    ),

    entities: mergeStructuredItems(
      previous.entities,
      normalizeEntities(
        input.entities,
        [],
      ),
      (item) =>
        item.name,
      (
        previousItem,
        incomingItem,
      ) => ({
        ...previousItem,
        ...incomingItem,
        id: previousItem.id,
        attributes: mergeUniqueStrings(
          previousItem.attributes,
          incomingItem.attributes,
        ),
      }),
    ),

    businessRules:
      mergeStructuredItems(
        previous.businessRules,
        normalizeBusinessRules(
          input.businessRules,
          [],
        ),
        (item) =>
          item.rule,
      ),

    decisionLogic:
      mergeStructuredItems(
        previous.decisionLogic,
        normalizeDecisionLogic(
          input.decisionLogic,
          [],
        ),
        (item) =>
          item.condition,
      ),

    validationRules:
      mergeStructuredItems(
        previous.validationRules,
        normalizeValidationRules(
          input.validationRules,
          [],
        ),
        (item) =>
          `${item.field}:${item.rule}`,
      ),

    edgeCases: mergeStructuredItems(
      previous.edgeCases,
      normalizeEdgeCases(
        input.edgeCases,
        [],
      ),
      (item) =>
        item.case,
    ),

    errorCases: mergeStructuredItems(
      previous.errorCases,
      normalizeErrorCases(
        input.errorCases,
        [],
      ),
      (item) =>
        item.error,
    ),

    integrations:
      mergeStructuredItems(
        previous.integrations,
        normalizeIntegrations(
          input.integrations,
          [],
        ),
        (item) =>
          item.name,
      ),

    notifications:
      mergeStructuredItems(
        previous.notifications,
        normalizeNotifications(
          input.notifications,
          [],
        ),
        (item) =>
          item.trigger,
      ),

    reporting: mergeStructuredItems(
      previous.reporting,
      normalizeReporting(
        input.reporting,
        [],
      ),
      (item) =>
        item.report,
    ),

    security: mergeStructuredItems(
      previous.security,
      normalizeSecurity(
        input.security,
        [],
      ),
      (item) =>
        item.requirement,
    ),
    openQuestions: asStringArray(input.openQuestions, previous.openQuestions),
    assumptions: asStringArray(input.assumptions, previous.assumptions),
    confidence: Math.min(1, Math.max(0, asNumber(input.confidence, previous.confidence))),
  };

  return systemUnderstandingSchema.parse(normalized);
}

export async function updateUnderstandingNode(
  state: Layer1GraphState,
): Promise<{
  understanding: SystemUnderstanding;
  usage: AiTokenUsage | null;
  error?: string;
}> {
  let usage: AiTokenUsage | null = null;

  try {
    const prompt =
      getUnderstandingUpdatePrompt(state);

    const requestUnderstanding = async (
      retry = false,
    ) =>
      callAiProviderWithUsage(
        [
          {
            role: 'user',
            content: retry
              ? `${prompt}

RETRY REQUIREMENT

Your previous response could not be parsed or validated as the required SystemUnderstanding JSON.

Return exactly one complete updated SystemUnderstanding object.

Requirements:
- Preserve previously established facts unless newer evidence changes them.
- Incorporate the newest answer.
- Keep arrays concise but complete.
- Do not include markdown, code fences, commentary, or trailing text.
- Before finishing, ensure every opened string, object, and array is closed.`
              : prompt,
          },
        ],
        {
          modelRole: 'clarification',
          responseFormat: 'json_object',
          temperature: retry
            ? 0.05
            : 0.2,

        },
      );

    const requestAndParse = async (
      retry = false,
    ): Promise<{
      understanding: SystemUnderstanding;
      usage: AiTokenUsage | null;
    }> => {
      const result =
        await requestUnderstanding(
          retry,
        );

      const parsedJson =
        JSON.parse(
          result.content,
        ) as unknown;

      return {
        understanding:
          normalizeSystemUnderstanding(
            parsedJson,
            state.understanding,
          ),

        usage:
          result.usage,
      };
    };

    try {
      const firstAttempt =
        await requestAndParse();

      return {
        understanding:
          firstAttempt.understanding,

        usage:
          firstAttempt.usage,
      };
    } catch {
      const retryAttempt =
        await requestAndParse(
          true,
        );

      return {
        understanding:
          retryAttempt.understanding,

        usage:
          retryAttempt.usage,
      };
    }
  } catch (err) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : 'Unknown understanding update error.';

    return {
      understanding: state.understanding,
      usage,
      error: errorMessage,
    };
  }
}
