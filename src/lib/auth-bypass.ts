/**
 * Temporary auth bypass for local development.
 * Enable with NEXT_PUBLIC_BYPASS_AUTH=true.
 */
export function isAuthBypassEnabled(): boolean {
  return process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
}
