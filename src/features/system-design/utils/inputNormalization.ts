export function normalizeSystemDesignInput(rawText: string): string {
  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

export function estimateTokenCount(text: string): number {
  if (!text.trim()) {
    return 0;
  }

  return Math.ceil(text.length / 4);
}

export function getInputSizeLabel(characters: number): string {
  if (characters === 0) {
    return 'Empty';
  }

  if (characters < 500) {
    return 'Small';
  }

  if (characters < 4000) {
    return 'Medium';
  }

  if (characters < 12000) {
    return 'Large';
  }

  return 'Very large';
}
