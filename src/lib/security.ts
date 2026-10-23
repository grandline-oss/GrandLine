/**
 * GrandLine Restaurant Management System - Security & Sanitization Utilities
 * Implements OWASP security controls for CSV injection, input validation, and rate limiting.
 */

/**
 * Sanitizes fields destined for CSV export to prevent Formula Injection (CWE-1236).
 * Prepends a single quote to cells beginning with dangerous spreadsheet control characters.
 */
export function sanitizeCsvField(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).trim();
  
  // If field starts with =, +, -, @, tab, or carriage return, neutralize formula execution
  const neutralized = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  
  // Standard CSV escaping: wrap in quotes and escape internal double quotes
  return `"${neutralized.replace(/"/g, '""')}"`;
}

/**
 * Client & session rate limiter to mitigate brute-force attacks on sensitive endpoints.
 */
interface RateLimitRecord {
  attempts: number;
  lockedUntil?: number;
  firstAttemptTime: number;
}

const RATE_LIMIT_KEY_PREFIX = 'grandline_rl_';

export function checkRateLimit(
  actionKey: string,
  maxAttempts: number = 5,
  windowMs: number = 5 * 60 * 1000, // 5 minutes
  lockoutMs: number = 2 * 60 * 1000 // 2 minutes lockout
): { allowed: boolean; waitSeconds?: number } {
  if (typeof window === 'undefined') return { allowed: true };

  try {
    const storageKey = `${RATE_LIMIT_KEY_PREFIX}${actionKey}`;
    const now = Date.now();
    const raw = sessionStorage.getItem(storageKey);
    let record: RateLimitRecord = raw
      ? JSON.parse(raw)
      : { attempts: 0, firstAttemptTime: now };

    // Check if currently locked out
    if (record.lockedUntil && record.lockedUntil > now) {
      const waitSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return { allowed: false, waitSeconds };
    }

    // Reset window if expired
    if (now - record.firstAttemptTime > windowMs) {
      record = { attempts: 0, firstAttemptTime: now };
    }

    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

export function recordFailedAttempt(
  actionKey: string,
  maxAttempts: number = 5,
  lockoutMs: number = 2 * 60 * 1000
): { locked: boolean; waitSeconds?: number } {
  if (typeof window === 'undefined') return { locked: false };

  try {
    const storageKey = `${RATE_LIMIT_KEY_PREFIX}${actionKey}`;
    const now = Date.now();
    const raw = sessionStorage.getItem(storageKey);
    const record: RateLimitRecord = raw
      ? JSON.parse(raw)
      : { attempts: 0, firstAttemptTime: now };

    record.attempts += 1;

    if (record.attempts >= maxAttempts) {
      record.lockedUntil = now + lockoutMs;
      sessionStorage.setItem(storageKey, JSON.stringify(record));
      return { locked: true, waitSeconds: Math.ceil(lockoutMs / 1000) };
    }

    sessionStorage.setItem(storageKey, JSON.stringify(record));
    return { locked: false };
  } catch {
    return { locked: false };
  }
}

export function resetRateLimit(actionKey: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(`${RATE_LIMIT_KEY_PREFIX}${actionKey}`);
  } catch {
    // ignore
  }
}

/**
 * Strict Input Sanitization & Validation Helpers
 */
export function sanitizeString(input: unknown, maxLength: number = 255): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

export function validatePositiveInt(val: unknown, min: number = 1, max: number = 1000000): number | null {
  const num = Number(val);
  if (!Number.isInteger(num) || num < min || num > max) {
    return null;
  }
  return num;
}
