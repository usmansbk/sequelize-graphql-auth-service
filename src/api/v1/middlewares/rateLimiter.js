import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redis from "~services/redis";

const client = redis.createClient();

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes interval
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => client.call(...args),
  }),
  delayMs: 0,
});

export default rateLimiter;
