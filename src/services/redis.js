import Redis from "ioredis";

const { REDIS_CLUSTER_MODE, REDIS_PORT, REDIS_HOST, REDIS_URL, NODE_ENV } =
  process.env;

const port = REDIS_PORT;
const host = REDIS_HOST;

const createClient = () => {
  const redisOptions = {
    tls: {
      rejectUnauthorized: false,
    },
  };

  if (REDIS_CLUSTER_MODE === "enabled") {
    return new Redis.Cluster(
      [
        {
          port,
          host,
        },
      ],
      {
        redisOptions,
      }
    );
  }

  if (REDIS_URL) {
    return new Redis(REDIS_URL, redisOptions);
  }

  return new Redis(
    { port, host },
    NODE_ENV === "production" ? redisOptions : undefined
  );
};

const client = createClient();

export default client;
