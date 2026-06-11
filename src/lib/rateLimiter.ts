import { RateLimiterMemory } from 'rate-limiter-flexible';

// Global in-memory store for rate limiting per configuration
// Maps config key to RateLimiterMemory instance
const rateLimiters: Map<string, RateLimiterMemory> = new Map();

/**
 * Get or create a rate limiter for a specific config
 * Creates with proper points and duration
 */
function getRateLimiter(key: string, maxPoints: number, duration: number): RateLimiterMemory {
  // Create a unique key that includes the config
  const configKey = `${key}_${maxPoints}_${duration}`;
  
  if (!rateLimiters.has(configKey)) {
    rateLimiters.set(configKey, new RateLimiterMemory({
      points: maxPoints,
      duration: duration,
    }));
  }
  return rateLimiters.get(configKey)!;
}

// Track blocked attempts for logging
export interface BlockedAttempt {
  ip: string;
  endpoint: string;
  reason: string;
  timestamp: Date;
  userAgent?: string;
}

const blockedAttempts: BlockedAttempt[] = [];

/**
 * Extract client IP from request headers
 * Handles proxies (Vercel, nginx, etc.)
 */
export function extractClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  // Fallback for direct connections
  return '127.0.0.1';
}

/**
 * Log a blocked attempt
 */
export function logBlockedAttempt(
  ip: string,
  endpoint: string,
  reason: string,
  userAgent?: string
): void {
  const attempt: BlockedAttempt = {
    ip,
    endpoint,
    reason,
    timestamp: new Date(),
    userAgent,
  };

  blockedAttempts.push(attempt);

  // Keep only last 1000 attempts in memory
  if (blockedAttempts.length > 1000) {
    blockedAttempts.shift();
  }

  // Log to console (for debugging)
  console.warn('[RATE_LIMITER] Blocked attempt:', {
    ip,
    endpoint,
    reason,
    timestamp: attempt.timestamp.toISOString(),
  });
}

/**
 * Get blocked attempts (for monitoring)
 */
export function getBlockedAttempts(limit = 100): BlockedAttempt[] {
  return blockedAttempts.slice(-limit);
}

/**
 * Rate limit by IP globally
 * Example: limitByIP(ip, 'scan', 100, 3600) = 100 requests per hour
 */
export async function limitByIP(
  ip: string,
  keyPrefix: string, // e.g., 'scan', 'auth-login', 'auth-register'
  maxPoints: number,
  durationSeconds: number
): Promise<boolean> {
  try {
    const key = `${keyPrefix}_${ip}`;
    // Use global rate limiter for this prefix with proper config
    const limiter = getRateLimiter(keyPrefix, maxPoints, durationSeconds);

    // Consume 1 point. If points are exceeded, this will throw an error
    await limiter.consume(key, 1);
    return true; // Request allowed
  } catch {
    // Error means rate limit exceeded
    return false;
  }
}

/**
 * Rate limit by IP + Resource (debouncing)
 * Example: limitByIPAndResource(ip, qrCode, 1, 30) = 1 request per 30 seconds per QR code
 */
export async function limitByIPAndResource(
  ip: string,
  resource: string,
  maxPoints: number,
  durationSeconds: number
): Promise<boolean> {
  try {
    const key = `resource_${ip}_${resource}`;
    // Use global rate limiter for resources with proper config
    const limiter = getRateLimiter('resource', maxPoints, durationSeconds);

    // Consume 1 point. If points are exceeded, this will throw an error
    await limiter.consume(key, 1);
    return true; // Request allowed
  } catch {
    // Error means rate limit exceeded
    return false;
  }
}

/**
 * Get remaining points for a key
 * Useful for responses and monitoring
 */
export async function getRemainingPoints(
  keyPrefix: string,
  ip: string,
  maxPoints: number,
  durationSeconds: number
): Promise<number> {
  try {
    const key = `${keyPrefix}_${ip}`;
    const limiter = getRateLimiter(keyPrefix, maxPoints, durationSeconds);

    const resPoints = await limiter.get(key);
    if (!resPoints) {
      return maxPoints; // No record, all points available
    }

    return Math.max(0, resPoints.remainingPoints);
  } catch {
    return maxPoints; // On error, return max
  }
}

/**
 * Reset rate limit for a key
 * Useful for manual testing or admin operations
 */
export async function resetRateLimit(keyPrefix: string, ip: string, maxPoints: number = 100, duration: number = 3600): Promise<void> {
  const key = `${keyPrefix}_${ip}`;
  try {
    const limiter = getRateLimiter(keyPrefix, maxPoints, duration);
    await limiter.delete(key);
    console.log(`[RATE_LIMITER] Reset limit for key: ${key}`);
  } catch (error) {
    console.error(`[RATE_LIMITER] Error resetting limit: ${error}`);
  }
}

/**
 * Configuration for standard rate limits
 */
export const RATE_LIMITS = {
  // Scan endpoint limits
  SCAN_GLOBAL: {
    points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS_PER_HOUR || '100'),
    duration: 3600, // 1 hour
    prefix: 'scan',
  },
  SCAN_DEBOUNCE: {
    points: 1,
    duration: parseInt(process.env.RATE_LIMIT_SCAN_DEBOUNCE_SECONDS || '30'),
    prefix: 'scan-debounce',
  },

  // Auth endpoint limits
  AUTH_LOGIN: {
    points: parseInt(process.env.RATE_LIMIT_AUTH_ATTEMPTS || '5'),
    duration: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MINUTES || '15') * 60,
    prefix: 'auth-login',
  },
  AUTH_REGISTER: {
    points: parseInt(process.env.RATE_LIMIT_AUTH_ATTEMPTS || '5'),
    duration: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MINUTES || '15') * 60,
    prefix: 'auth-register',
  },
  AUTH_FORGOT_PASSWORD: {
    points: parseInt(process.env.RATE_LIMIT_AUTH_ATTEMPTS || '5'),
    duration: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MINUTES || '15') * 60,
    prefix: 'auth-forgot-password',
  },
};

/**
 * Check if rate limiting is enabled
 */
export function isRateLimitingEnabled(): boolean {
  const enabled = process.env.RATE_LIMIT_ENABLED !== 'false';
  return enabled;
}
