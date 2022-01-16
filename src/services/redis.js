import Redis from "ioredis";

const createRedisServer = () => {
  if (process.env.REDIS_URL) {
    return new Redis(process.env.REDIS_URL);
  }

  return new Redis();
};

export default createRedisServer;
