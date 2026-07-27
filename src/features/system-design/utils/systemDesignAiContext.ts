type AnyRecord = Record<string, unknown>;

function isRecord(value: unknown): value is AnyRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function pickText(record: AnyRecord, keys: string[]): string {
  for (const key of keys) {
    const value = asText(record[key]);

    if (value) {
      return value;
    }
  }

  return '';
}

function compactItems(value: unknown, keys: string[], maxItems = 8): unknown[] {
  return asArray(value)
    .slice(0, maxItems)
    .map((item) => {
      if (typeof item === 'string') {
        return item.trim();
      }

      if (!isRecord(item)) {
        return null;
      }

      const result: AnyRecord = {};

      keys.forEach((key) => {
        const itemValue = item[key];

        if (Array.isArray(itemValue)) {
          const compactArray = itemValue
            .map((entry) =>
              typeof entry === 'string'
                ? entry.trim()
                : isRecord(entry)
                  ? pickText(entry, [
                      'name',
                      'title',
                      'description',
                      'rule',
                      'condition',
                      'outcome',
                      'error',
                      'handling',
                    ])
                  : ''
            )
            .filter(Boolean)
            .slice(0, 8);

          if (compactArray.length > 0) {
            result[key] = compactArray;
          }

          return;
        }

        const text = asText(itemValue);

        if (text) {
          result[key] = text;
        }
      });

      return Object.keys(result).length > 0 ? result : null;
    })
    .filter(Boolean);
}

export function buildSlimUnderstandingContext(understanding: unknown): unknown {
  if (!isRecord(understanding)) {
    return {};
  }

  return {
    summary: asText(understanding.summary),
    goal: asText(understanding.goal),
    confidence: understanding.confidence,

    actors: compactItems(understanding.actors, ['id', 'name', 'role', 'description'], 8),

    workflows: compactItems(understanding.workflows, ['id', 'title', 'steps'], 8),

    inputs: compactItems(understanding.inputs, ['id', 'name', 'description'], 8),

    outputs: compactItems(understanding.outputs, ['id', 'name', 'description'], 8),

    entities: compactItems(understanding.entities, ['id', 'name', 'attributes'], 10),

    businessRules: compactItems(understanding.businessRules, ['id', 'rule'], 10),

    decisionLogic: compactItems(understanding.decisionLogic, ['id', 'condition', 'outcome'], 10),

    validationRules: compactItems(understanding.validationRules, ['id', 'field', 'rule'], 8),

    integrations: compactItems(understanding.integrations, ['id', 'name', 'purpose'], 8),

    securityRequirements: compactItems(
      understanding.securityRequirements,
      ['id', 'requirement'],
      8
    ),

    edgeCases: compactItems(understanding.edgeCases, ['id', 'case'], 8),

    errorCases: compactItems(understanding.errorCases, ['id', 'error', 'handling'], 8),

    assumptions: compactItems(
      understanding.assumptions,
      ['id', 'assumption', 'text', 'description'],
      8
    ),

    openQuestions: compactItems(understanding.openQuestions, ['id', 'question', 'category'], 8),
  };
}

export function buildSlimQuestionContext(state: {
  understanding: unknown;
  completeness?: unknown;
  currentQuestion?: unknown;
  conversation?: Array<{
    kind?: string;
    questionId?: string;
    answerId?: string;
    content?: string;
  }>;
  questions?: Array<{
    id: string;
    question: string;
    category: string;
    answer?: string;
  }>;
}): unknown {
  const conversationAnswerQuestionIds = (state.conversation ?? [])
    .filter((message) => Boolean(message.answerId && message.questionId))
    .map((message) => message.questionId);

  const answeredQuestionIds = new Set(conversationAnswerQuestionIds);

  const lastAnsweredQuestions = (state.questions ?? [])
    .filter((question) => answeredQuestionIds.has(question.id))
    .slice(-6)
    .map((question) => ({
      q: question.question,
      c: question.category,
    }));

  return {
    understanding: buildSlimUnderstandingContext(state.understanding),
    readiness: state.completeness
      ? {
          overallScore: isRecord(state.completeness) ? state.completeness.overallScore : undefined,
          readyForDiagram: isRecord(state.completeness)
            ? state.completeness.readyForDiagram
            : undefined,
          missingCriticalItems: isRecord(state.completeness)
            ? state.completeness.missingCriticalItems
            : undefined,
          weakItems: isRecord(state.completeness) ? state.completeness.weakItems : undefined,
          suggestedNextQuestionCategory: isRecord(state.completeness)
            ? state.completeness.suggestedNextQuestionCategory
            : undefined,
        }
      : null,
    currentPendingQuestion: isRecord(state.currentQuestion)
      ? {
          q: state.currentQuestion.question,
          c: state.currentQuestion.category,
        }
      : null,
    recentlyAnsweredQuestions: lastAnsweredQuestions,
  };
}

export function buildSlimDiagramContext(understanding: unknown): unknown {
  const slim = buildSlimUnderstandingContext(understanding) as AnyRecord;

  return {
    goal: slim.goal,
    summary: slim.summary,
    actors: slim.actors,
    workflows: slim.workflows,
    decisions: slim.decisionLogic,
    data: {
      inputs: slim.inputs,
      outputs: slim.outputs,
      entities: slim.entities,
    },
    rules: slim.businessRules,
    validation: slim.validationRules,
    integrations: slim.integrations,
    security: slim.securityRequirements,
    failures: {
      edgeCases: slim.edgeCases,
      errorCases: slim.errorCases,
    },
  };
}
