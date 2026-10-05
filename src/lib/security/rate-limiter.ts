/**
 * Rate Limiter Engine for ExploreTN
 * Provides high-performance in-memory sliding-window rate limiting with optional Upstash Redis fallback.
 * Operates without requiring external paid services by default.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

// Periodic cleanup of stale memory records every 60 seconds
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
      if (record.resetAt <= now) {
        memoryStore.delete(key);
      }
    }
  }, 60000);
}

export interface RateLimitOptions {
  limit: number;      // Max allowed requests in interval
  windowMs: number;   // Window duration in milliseconds
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
  retryAfterSeconds: number;
}

export function getClientIp(request: Request): string {
  const headers = request.headers;
  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const ips = xForwardedFor.split(",").map((ip) => ip.trim());
    if (ips[0]) return ips[0];
  }
  const xRealIp = headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();
  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();
  return "127.0.0.1";
}

/**
 * Check if the request is within rate limits
 */
export async function checkRateLimit(
  key: string,
  options: RateLimitOptions = { limit: 60, windowMs: 60000 }
): Promise<RateLimitResult> {
  // Optional Upstash KV integration if configured in environment
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      const windowSeconds = Math.ceil(options.windowMs / 1000);
      const redisKey = `ratelimit:${key}`;
      
      const incrRes = await fetch(`${upstashUrl}/incr/${encodeURIComponent(redisKey)}`, {
        headers: { Authorization: `Bearer ${upstashToken}` },
      });
      const incrData = (await incrRes.json()) as { result?: number };
      const currentCount = incrData.result ?? 1;

      if (currentCount === 1) {
        await fetch(`${upstashUrl}/expire/${encodeURIComponent(redisKey)}/${windowSeconds}`, {
          headers: { Authorization: `Bearer ${upstashToken}` },
        });
      }

      const allowed = currentCount <= options.limit;
      return {
        allowed,
        remaining: Math.max(0, options.limit - currentCount),
        resetMs: options.windowMs,
        retryAfterSeconds: allowed ? 0 : windowSeconds,
      };
    } catch (err) {
      console.warn("[RateLimiter] Upstash error, falling back to in-memory:", err);
    }
  }

  // Fallback to high-speed in-memory sliding window
  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || record.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + options.windowMs });
    return {
      allowed: true,
      remaining: options.limit - 1,
      resetMs: options.windowMs,
      retryAfterSeconds: 0,
    };
  }

  record.count += 1;
  const remaining = Math.max(0, options.limit - record.count);
  const resetMs = Math.max(0, record.resetAt - now);
  const allowed = record.count <= options.limit;

  return {
    allowed,
    remaining,
    resetMs,
    retryAfterSeconds: allowed ? 0 : Math.ceil(resetMs / 1000),
  };
}
