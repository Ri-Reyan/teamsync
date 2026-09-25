import { Request, Response, NextFunction } from "express";
import redisClient from "../lib/redis.js";
import sendResponse from "../global/sendResponse.js";

type RateLimiterOptions = {
  windowMs: number;
  max: number;
  keyPrefix?: string;
};

const getClientKey = (req: Request) =>
  req.ip || req.socket.remoteAddress || "unknown";

const rateLimiter = ({
  windowMs,
  max,
  keyPrefix = "api",
}: RateLimiterOptions) => {
  if (windowMs <= 0 || max <= 0) {
    throw new Error("Rate limiter windowMs and max must be greater than zero");
  }

  const windowSeconds = Math.ceil(windowMs / 1000);

  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `rate-limit:${keyPrefix}:${getClientKey(req)}`;

    try {
      if (!redisClient.isReady) {
        return next();
      }

      const count = await redisClient.incr(key);

      if (count === 1) {
        await redisClient.expire(key, windowSeconds);
      }

      const ttl = Math.max(await redisClient.ttl(key), 0);
      const remaining = Math.max(max - count, 0);

      res.setHeader("RateLimit-Limit", max);
      res.setHeader("RateLimit-Remaining", remaining);
      res.setHeader("RateLimit-Reset", Math.ceil(Date.now() / 1000) + ttl);

      if (count > max) {
        res.setHeader("Retry-After", ttl);

        sendResponse(res, {
          success: false,
          statusCode: 429,
          message: "Too many requests. Please try again later.",
        });
      }

      return next();
    } catch (error) {
      console.error("Rate limiter error:", error);
      return next();
    }
  };
};

export default rateLimiter;
