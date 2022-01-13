import rateLimit from "express-rate-limit";

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes interval
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

export default rateLimiter;
