/**
 * Markdown Sanitization Utilities
 * Feature: 006-markdown-features-start
 *
 * XSS protection utilities for markdown links
 */

/**
 * Validates if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if a URL is safe (blocks javascript: and data: URLs)
 */
export function isSafeUrl(url: string): boolean {
  const normalizedUrl = url.trim().toLowerCase();
  
  // Block dangerous URL schemes
  if (normalizedUrl.startsWith('javascript:') || 
      normalizedUrl.startsWith('data:') ||
      normalizedUrl.startsWith('vbscript:')) {
    return false;
  }
  
  return true;
}

/**
 * Checks if a URL is external (different domain)
 */
export function isExternalUrl(url: string): boolean {
  if (!isValidUrl(url)) {
    return false;
  }
  
  try {
    const urlObj = new URL(url);
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
    return urlObj.hostname !== currentHost;
  } catch {
    return false;
  }
}

/**
 * Sanitizes a URL for use in markdown links
 * Returns the URL if safe, or '#' if dangerous
 */
export function sanitizeUrl(url: string): string {
  if (!url || !isSafeUrl(url)) {
    return '#';
  }
  return url;
}
