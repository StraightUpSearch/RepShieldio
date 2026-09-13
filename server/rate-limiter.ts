import { Request, Response, NextFunction } from "express";

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message: string;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  createLimiter(options: RateLimitOptions) {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = req.ip || 'unknown';
      const now = Date.now();
      const windowStart = now - options.windowMs;

      // Get existing requests for this IP
      let requests = this.requests.get(key) || [];
      
      // Filter out old requests
      requests = requests.filter(time => time > windowStart);
      
      // Check if limit exceeded
      if (requests.length >= options.max) {
        return res.status(429).json({
          success: false,
          message: options.message,
          retryAfter: Math.ceil(options.windowMs / 1000)
        });
      }

      // Add current request
      requests.push(now);
      this.requests.set(key, requests);

      next();
    };
  }

  // Clean up old entries periodically
  cleanup() {
    const now = Date.now();
    const maxAge = 15 * 60 * 1000; // 15 minutes

    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => time > now - maxAge);
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// Start cleanup interval
setInterval(() => {
  rateLimiter.cleanup();
}, 5 * 60 * 1000); // Clean up every 5 minutes

// Preset limiters
export const strictLimiter = rateLimiter.createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: "Too many requests. Please try again later."
});

export const moderateLimiter = rateLimiter.createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: "Too many requests. Please try again later."
});

export const generalLimiter = rateLimiter.createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: "Too many requests. Please try again later."
});