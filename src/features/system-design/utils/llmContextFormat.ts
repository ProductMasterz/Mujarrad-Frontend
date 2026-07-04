export function compactJson(value: unknown): string {
  if (value === undefined) {
    return 'null';
  }

  return JSON.stringify(value);
}

export function compactQaHistory(
  items: Array<{
    question: string;
    answer: string;
  }>,
): string {
  if (items.length === 0) {
    return 'none';
  }

  return items
    .map(
      (item, index) =>
        `Q${index + 1}:${item.question.trim()}\nA${index + 1}:${item.answer.trim()}`,
    )
    .join('\n');
}

export function compactRevisionHistory(
  revisions: Array<{
    instruction?: string;
  }>,
): string {
  if (revisions.length === 0) {
    return 'none';
  }

  return revisions
    .map((revision, index) => {
      const label = index === 0 ? 'original' : `r${index}`;
      const instruction =
        revision.instruction?.trim() || 'diagram update';

      return `${label}:${instruction}`;
    })
    .join('\n');
}
