import { describe, it, expect, jest } from '@jest/globals';
import {
  cn,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  truncate,
  slugify,
  debounce,
  deepClone,
  isBrowser,
  isServer,
  safeJsonParse,
  formatBytes,
} from '../utils';

describe('cn (className merger)', () => {
  it('should merge class names', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should handle conditional classes', () => {
    expect(cn('base', true && 'conditional')).toContain('conditional');
    expect(cn('base', false && 'conditional')).not.toContain('conditional');
  });

  it('should handle Tailwind class conflicts', () => {
    const result = cn('text-red-500', 'text-blue-500');
    // twMerge should keep only the last conflicting class
    expect(result).toBe('text-blue-500');
  });

  it('should handle undefined and null values', () => {
    expect(cn('base', undefined, null, 'other')).toContain('base');
    expect(cn('base', undefined, null, 'other')).toContain('other');
  });
});

describe('formatDate', () => {
  it('should format ISO date to readable format', () => {
    const iso = '2024-01-15T10:30:00Z';
    const formatted = formatDate(iso);
    expect(formatted).toContain('Jan');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2024');
  });

  it('should handle different months', () => {
    const iso = '2024-12-25T10:30:00Z';
    const formatted = formatDate(iso);
    expect(formatted).toContain('Dec');
    expect(formatted).toContain('25');
  });
});

describe('formatDateTime', () => {
  it('should format ISO datetime to readable format with time', () => {
    const iso = '2024-01-15T10:30:00Z';
    const formatted = formatDateTime(iso);
    expect(formatted).toMatch(/\d{1,2}:\d{2}/); // Contains time
    expect(formatted).toContain('Jan');
  });

  it('should include AM/PM', () => {
    const iso = '2024-01-15T14:30:00Z';
    const formatted = formatDateTime(iso);
    expect(formatted).toMatch(/AM|PM/);
  });
});

describe('formatRelativeTime', () => {
  it('should show "just now" for recent times', () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe('just now');
  });

  it('should show seconds as "just now"', () => {
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();
    expect(formatRelativeTime(thirtySecondsAgo)).toBe('just now');
  });

  it('should show minutes ago', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(fiveMinutesAgo)).toContain('minute');
  });

  it('should show singular minute', () => {
    const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000).toISOString();
    expect(formatRelativeTime(oneMinuteAgo)).toBe('1 minute ago');
  });

  it('should show plural minutes', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
  });

  it('should show hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(twoHoursAgo)).toContain('hour');
  });

  it('should show days ago', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(threeDaysAgo)).toContain('day');
  });

  it('should show formatted date for old dates', () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    const result = formatRelativeTime(tenDaysAgo);
    // Should return formatted date after 7 days
    expect(result).toMatch(/\w{3}\s\d{1,2},\s\d{4}/);
  });
});

describe('truncate', () => {
  it('should not truncate short text', () => {
    expect(truncate('short', 10)).toBe('short');
  });

  it('should truncate long text', () => {
    const longText = 'This is a very long text that needs truncation';
    const truncated = truncate(longText, 20);
    expect(truncated).toHaveLength(20);
    expect(truncated).toContain('...');
  });

  it('should handle exact length', () => {
    const text = 'exactly10!';
    expect(truncate(text, 10)).toBe('exactly10!');
  });

  it('should truncate and add ellipsis', () => {
    const truncated = truncate('Hello World', 8);
    expect(truncated).toBe('Hello...');
  });
});

describe('slugify', () => {
  it('should convert text to slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('should remove special characters', () => {
    expect(slugify('Hello@World!')).toBe('helloworld');
  });

  it('should handle multiple spaces', () => {
    expect(slugify('Hello   World')).toBe('hello-world');
  });

  it('should trim hyphens', () => {
    expect(slugify('-Hello World-')).toBe('hello-world');
  });

  it('should handle underscores', () => {
    expect(slugify('Hello_World')).toBe('hello-world');
  });

  it('should handle mixed case', () => {
    expect(slugify('ThE QuIcK BrOwN FoX')).toBe('the-quick-brown-fox');
  });

  it('should handle numbers', () => {
    expect(slugify('Test 123')).toBe('test-123');
  });
});

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should debounce function calls', () => {
    let callCount = 0;
    const fn = debounce(() => {
      callCount++;
    }, 100);

    fn();
    fn();
    fn();

    expect(callCount).toBe(0);

    jest.advanceTimersByTime(100);

    expect(callCount).toBe(1);
  });

  it('should pass arguments to debounced function', () => {
    let lastArg: string | undefined;
    const fn = debounce((arg: string) => {
      lastArg = arg;
    }, 100);

    fn('first');
    fn('second');
    fn('third');

    jest.advanceTimersByTime(100);

    expect(lastArg).toBe('third');
  });

  it('should reset timer on new call', () => {
    let callCount = 0;
    const fn = debounce(() => {
      callCount++;
    }, 100);

    fn();
    jest.advanceTimersByTime(50);
    fn();
    jest.advanceTimersByTime(50);

    expect(callCount).toBe(0);

    jest.advanceTimersByTime(50);

    expect(callCount).toBe(1);
  });
});

describe('deepClone', () => {
  it('should clone primitive values', () => {
    expect(deepClone(42)).toBe(42);
    expect(deepClone('string')).toBe('string');
    expect(deepClone(true)).toBe(true);
    expect(deepClone(null)).toBe(null);
  });

  it('should clone arrays', () => {
    const arr = [1, 2, 3];
    const cloned = deepClone(arr);
    expect(cloned).toEqual(arr);
    expect(cloned).not.toBe(arr);
  });

  it('should clone objects', () => {
    const obj = { a: 1, b: 2 };
    const cloned = deepClone(obj);
    expect(cloned).toEqual(obj);
    expect(cloned).not.toBe(obj);
  });

  it('should clone nested objects', () => {
    const obj = { a: 1, b: { c: 2, d: { e: 3 } } };
    const cloned = deepClone(obj);
    expect(cloned).toEqual(obj);
    expect(cloned.b).not.toBe(obj.b);
    expect(cloned.b.d).not.toBe(obj.b.d);
  });

  it('should clone dates', () => {
    const date = new Date('2024-01-15');
    const cloned = deepClone(date);
    expect(cloned.getTime()).toBe(date.getTime());
    expect(cloned).not.toBe(date);
  });

  it('should clone arrays of objects', () => {
    const arr = [{ a: 1 }, { b: 2 }];
    const cloned = deepClone(arr);
    expect(cloned).toEqual(arr);
    expect(cloned[0]).not.toBe(arr[0]);
  });
});

describe('isBrowser', () => {
  it('should return true in browser environment', () => {
    // jsdom environment has window defined
    expect(isBrowser()).toBe(true);
  });
});

describe('isServer', () => {
  it('should return false in browser environment', () => {
    // jsdom environment has window defined
    expect(isServer()).toBe(false);
  });
});

describe('safeJsonParse', () => {
  it('should parse valid JSON', () => {
    const json = '{"a":1,"b":"test"}';
    const result = safeJsonParse(json, {});
    expect(result).toEqual({ a: 1, b: 'test' });
  });

  it('should return fallback for invalid JSON', () => {
    const invalidJson = '{invalid json}';
    const fallback = { default: true };
    const result = safeJsonParse(invalidJson, fallback);
    expect(result).toBe(fallback);
  });

  it('should handle arrays', () => {
    const json = '[1,2,3]';
    const result = safeJsonParse(json, []);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should return fallback for empty string', () => {
    const fallback = { empty: true };
    const result = safeJsonParse('', fallback);
    expect(result).toBe(fallback);
  });
});

describe('formatBytes', () => {
  it('should format zero bytes', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
  });

  it('should format bytes', () => {
    expect(formatBytes(500)).toBe('500 Bytes');
  });

  it('should format kilobytes', () => {
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(2048)).toBe('2 KB');
  });

  it('should format megabytes', () => {
    expect(formatBytes(1048576)).toBe('1 MB');
  });

  it('should format gigabytes', () => {
    expect(formatBytes(1073741824)).toBe('1 GB');
  });

  it('should handle decimal places', () => {
    expect(formatBytes(1234567, 2)).toContain('1.18');
  });

  it('should default to 2 decimal places', () => {
    const result = formatBytes(1234567);
    expect(result).toMatch(/^\d+\.\d{2}\s\w+$/);
  });
});
