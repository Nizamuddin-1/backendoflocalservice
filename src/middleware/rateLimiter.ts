import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const stores: Record<string, RateLimitStore> = {};

function getStore(name: string): RateLimitStore {
  if (!stores[name]) stores[name] = {};
  return stores[name];
}

function createRateLimiter(options: {
  windowMs: number;
  max: number;
  name: string;
  message?: string;
}) {
  const store = getStore(options.name);

  const cleanup = () => {
    const now = Date.now();
    for (const key in store) {
      if (store[key].resetTime <= now) {
        delete store[key];
      }
    }
  };

  const interval = setInterval(cleanup, 60_000);
  if (interval.unref) interval.unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = `${req.ip || req.socket.remoteAddress}`;
    const now = Date.now();

    if (!store[key] || store[key].resetTime <= now) {
      store[key] = { count: 1, resetTime: now + options.windowMs };
    } else {
      store[key].count++;
    }

    const remaining = Math.max(0, options.max - store[key].count);
    const retryAfter = store[key].resetTime - now;

    res.set('X-RateLimit-Limit', String(options.max));
    res.set('X-RateLimit-Remaining', String(remaining));
    res.set('X-RateLimit-Reset', String(Math.ceil(store[key].resetTime / 1000)));

    if (store[key].count > options.max) {
      res.set('Retry-After', String(Math.ceil(retryAfter / 1000)));
      res.status(429).json({
        data: null,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: options.message || 'Too many requests, please try again later.',
        },
      });
      return;
    }

    next();
  };
}

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  name: 'auth',
  message: 'Too many authentication attempts, please try again later.',
});

export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  name: 'api',
  message: 'Too many requests, please try again later.',
});

export const uploadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  name: 'upload',
  message: 'Too many upload requests, please try again later.',
});

export const bookingLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  name: 'booking',
  message: 'Too many booking requests, please try again later.',
});
