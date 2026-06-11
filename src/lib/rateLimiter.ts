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
 * Handles proxies (Vercel, nginx, etc.) and prevents spoofing
 */
export function extractClientIp(request: Request): string {
  // 1. Trust Vercel-specific header in production
  // Vercel sets this automatically and it cannot be spoofed by clients
  const vercelForwarded = request.headers.get('x-vercel-forwarded-for');
  if (vercelForwarded) {
    return vercelForwarded.trim();
  }

  // 2. Fallback to standard x-forwarded-for with validation
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // Vercel appends proxy IPs: "client_ip, vercel_proxy1, vercel_proxy2"
    // We filter for the first valid IP to prevent spoofing if possible, 
    // though x-vercel-forwarded-for is much safer.
    const ips = forwarded.split(',').map(ip => ip.trim());
    
    for (const ip of ips) {
      if (isValidIP(ip)) {
        return ip;
      }
    }
  }

  // 3. Fallback to x-real-ip
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    const ip = realIp.trim();
    if (isValidIP(ip)) return ip;
  }

  // Fallback for direct connections
  return '127.0.0.1';
}

/**
 * Validate IP address format (IPv4 or IPv6)
 */
function isValidIP(ip: string): boolean {
  // IPv4 validation
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(ip)) {
    return ip.split('.').every(octet => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255 && String(num) === octet;
    });
  }

  // IPv6 validation (simple check)
  const ipv6Regex = /^[0-9a-fA-F:]+$/;
  if (ipv6Regex.test(ip)) {
    const parts = ip.split(':');
    return parts.length >= 2 && parts.length <= 8;
  }

  return false;
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
  AUTH_RESET_PASSWORD: {
    points: parseInt(process.env.RATE_LIMIT_AUTH_ATTEMPTS || '5'),
    duration: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MINUTES || '15') * 60,
    prefix: 'auth-reset-password',
  },
  AUTH_VERIFY_EMAIL: {
    points: parseInt(process.env.RATE_LIMIT_AUTH_ATTEMPTS || '5'),
    duration: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MINUTES || '15') * 60,
    prefix: 'auth-verify-email',
  },
  PUBLIC_ITEM: {
    points: 30,
    duration: 60,
    prefix: 'public-item',
  },
};

/**
 * Check if rate limiting is enabled
 */
export function isRateLimitingEnabled(): boolean {
  const enabled = process.env.RATE_LIMIT_ENABLED !== 'false';
  return enabled;
}
