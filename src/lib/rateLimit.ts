interface RateLimitConfig {
  maxRequests: number;
  timeWindow: number; // in milliseconds
}

interface RateLimitState {
  requests: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitState>;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.limits = new Map();
    this.config = config;
  }

  async checkLimit(key: string): Promise<boolean> {
    const now = Date.now();
    const state = this.limits.get(key) || { requests: 0, resetTime: now + this.config.timeWindow };

    // Reset if time window has passed
    if (now > state.resetTime) {
      state.requests = 0;
      state.resetTime = now + this.config.timeWindow;
    }

    // Check if limit is exceeded
    if (state.requests >= this.config.maxRequests) {
      const waitTime = state.resetTime - now;
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.checkLimit(key);
      }
    }

    // Increment request count
    state.requests++;
    this.limits.set(key, state);

    return true;
  }

  getRemainingRequests(key: string): number {
    const now = Date.now();
    const state = this.limits.get(key);

    if (!state || now > state.resetTime) {
      return this.config.maxRequests;
    }

    return Math.max(0, this.config.maxRequests - state.requests);
  }

  getResetTime(key: string): number {
    const state = this.limits.get(key);
    return state ? state.resetTime : Date.now() + this.config.timeWindow;
  }
}

// Platform-specific rate limiters
export const twitterRateLimiter = new RateLimiter({
  maxRequests: 300,
  timeWindow: 15 * 60 * 1000 // 15 minutes
});

export const instagramRateLimiter = new RateLimiter({
  maxRequests: 200,
  timeWindow: 60 * 60 * 1000 // 1 hour
});

export const facebookRateLimiter = new RateLimiter({
  maxRequests: 200,
  timeWindow: 60 * 60 * 1000 // 1 hour
});

export const linkedinRateLimiter = new RateLimiter({
  maxRequests: 100,
  timeWindow: 60 * 60 * 1000 // 1 hour
});

export const youtubeRateLimiter = new RateLimiter({
  maxRequests: 100,
  timeWindow: 60 * 60 * 1000 // 1 hour
});
