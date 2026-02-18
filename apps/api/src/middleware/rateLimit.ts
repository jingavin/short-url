import type { Request, Response, NextFunction } from "express";
import { redis } from "../lib/redis";

type RateLimitOpts = {
  windowSec: number;
  max: number;
  keyPrefix: string;
  keyFn?: (req: Request) => string;
};

export function rateLimit(opts: RateLimitOpts) {
  const { windowSec, max, keyPrefix, keyFn } = opts;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identity = keyFn ? keyFn(req) : req.ip;
      const key = `${keyPrefix}:${identity}`;

      const count = await redis.incr(key);

      if (count === 1) {
        await redis.expire(key, windowSec);
      }

      if (count > max) {
        const ttl = await redis.ttl(key);
        res.setHeader("Retry-After", Math.max(ttl, 0));
        return res.status(429).json({
          error: "Too many requests",
          retryAfterSec: Math.max(ttl, 0),
        });
      }

      next();
    } catch (err) {

      next();
    }
  };
}
