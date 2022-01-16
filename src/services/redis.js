import Redis from "ioredis";

const createRedisClient = () => {
  if (process.env.REDIS_URL) {
    return new Redis(process.env.REDIS_URL);
  }

  return new Redis();
};

const redisClient = createRedisClient();

export default redisClient;
