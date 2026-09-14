export type RateLimitAction =
  | "chat"
  | "reports"
  | "upload"
  | "search"
  | "evaluation";

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
  resetTimeMs: number;
}

// Configured tiers according to Phase 8 specifications
const RATE_LIMIT_RULES: Record<RateLimitAction, RateLimitConfig> = {
  chat: { limit: 20, windowMs: 60 * 1000 }, // 20 chats/min
  reports: { limit: 5, windowMs: 60 * 1000 }, // 5 agent reports/min
  upload: { limit: 10, windowMs: 10 * 60 * 1000 }, // 10 uploads/10 min
  search: { limit: 60, windowMs: 60 * 1000 }, // 60 searches/min
  evaluation: { limit: 3, windowMs: 10 * 60 * 1000 }, // 3 eval runs/10 min
};

class SlidingWindowRateLimiter {
  private store: Map<string, number[]> = new Map();
  private lastCleanup = Date.now();

  constructor() {
    // Run cleanup every 5 minutes if process is persistent
    if (typeof setInterval !== "undefined") {
      const timer = setInterval(() => this.cleanup(), 5 * 60 * 1000);
      if (timer.unref) {
        timer.unref();
      }
    }
  }

  public check(action: RateLimitAction, identifier: string): RateLimitResult {
    const now = Date.now();
    const config = RATE_LIMIT_RULES[action] || { limit: 30, windowMs: 60 * 1000 };
    const windowStart = now - config.windowMs;
    const key = `${action}:${identifier}`;

    let timestamps = this.store.get(key) || [];
    // Filter timestamps within current sliding window
    timestamps = timestamps.filter((t) => t > windowStart);

    if (timestamps.length >= config.limit) {
      // Exceeded limit: oldest timestamp determines when the first slot opens up
      const oldestTimestamp = timestamps[0];
      const resetTimeMs = oldestTimestamp + config.windowMs;
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((resetTimeMs - now) / 1000)
      );

      this.store.set(key, timestamps);
      return {
        allowed: false,
        limit: config.limit,
        remaining: 0,
        retryAfterSeconds,
        resetTimeMs,
      };
    }

    // Allowed: add current timestamp
    timestamps.push(now);
    this.store.set(key, timestamps);

    return {
      allowed: true,
      limit: config.limit,
      remaining: config.limit - timestamps.length,
      retryAfterSeconds: 0,
      resetTimeMs: now + config.windowMs,
    };
  }

  public peek(action: RateLimitAction, identifier: string): RateLimitResult {
    const now = Date.now();
    const config = RATE_LIMIT_RULES[action] || { limit: 30, windowMs: 60 * 1000 };
    const windowStart = now - config.windowMs;
    const key = `${action}:${identifier}`;

    const timestamps = (this.store.get(key) || []).filter((t) => t > windowStart);
    const remaining = Math.max(0, config.limit - timestamps.length);

    return {
      allowed: remaining > 0,
      limit: config.limit,
      remaining,
      retryAfterSeconds: 0,
      resetTimeMs: now + config.windowMs,
    };
  }

  public reset(action?: RateLimitAction, identifier?: string): void {
    if (action && identifier) {
      this.store.delete(`${action}:${identifier}`);
    } else if (action) {
      for (const k of this.store.keys()) {
        if (k.startsWith(`${action}:`)) this.store.delete(k);
      }
    } else {
      this.store.clear();
    }
  }

  private cleanup(): void {
    const now = Date.now();
    // 15 minutes cutoff
    const maxWindow = 15 * 60 * 1000;
    for (const [key, timestamps] of this.store.entries()) {
      const valid = timestamps.filter((t) => now - t < maxWindow);
      if (valid.length === 0) {
        this.store.delete(key);
      } else {
        this.store.set(key, valid);
      }
    }
    this.lastCleanup = now;
  }
}

// Global singleton for server-side in-memory rate limiting
const globalLimiter = new SlidingWindowRateLimiter();

export function checkRateLimit(
  action: RateLimitAction,
  identifier: string
): RateLimitResult {
  return globalLimiter.check(action, identifier);
}

export function peekRateLimit(
  action: RateLimitAction,
  identifier: string
): RateLimitResult {
  return globalLimiter.peek(action, identifier);
}

export function resetRateLimit(action?: RateLimitAction, identifier?: string): void {
  globalLimiter.reset(action, identifier);
}

/**
 * Helper to check rate limit and return user-friendly error payload if exceeded
 */
export function enforceRateLimit(
  action: RateLimitAction,
  identifier: string
): { allowed: true } | { allowed: false; error: string; retryAfterSeconds: number } {
  const result = checkRateLimit(action, identifier);
  if (!result.allowed) {
    const actionLabel: Record<RateLimitAction, string> = {
      chat: "Chat messaging",
      reports: "Report generation",
      upload: "Document upload",
      search: "Knowledge search",
      evaluation: "Evaluation benchmark",
    };

    return {
      allowed: false,
      error: `${actionLabel[action]} rate limit reached. Please wait ${result.retryAfterSeconds}s before trying again.`,
      retryAfterSeconds: result.retryAfterSeconds,
    };
  }

  return { allowed: true };
}
