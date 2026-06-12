export function createSystemDesignId(prefix: string): string {
  const safePrefix = prefix
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const randomPart =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${safePrefix || 'id'}-${randomPart}`;
}

export function createIsoTimestamp(): string {
  return new Date().toISOString();
}
