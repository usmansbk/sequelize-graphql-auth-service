import Redis from "ioredis";

const createClient = () => {
  if (process.env.REDIS_URL) {
    return new Redis(process.env.REDIS_URL, {
      tls: {
        rejectUnauthorized: false,
      },
    });
  }
  return new Redis({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
  });
};

const client = createClient();

export default client;
