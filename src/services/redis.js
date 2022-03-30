import Redis from "ioredis";

const createClient = () => {
  if (process.env.REDIS_URL) {
    return new Redis(process.env.REDIS_URL);
  }
  return new Redis();
};

const client = createClient();

export default client;
