import Redis from "ioredis";

const port = process.env.REDIS_PORT;
const host = process.env.REDIS_HOST;

const createClient = () => {
  if (process.env.REDIS_CLUSTER_MODE === "enabled") {
    return new Redis.Cluster(
      [
        {
          port,
          host,
        },
      ],
      {
        redisOptions: {
          tls: {
            rejectUnauthorized: false,
          },
        },
      }
    );
  }

  if (process.env.REDIS_URL) {
    return new Redis(process.env.REDIS_URL, {
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return new Redis({
    port,
    host,
  });
};

const client = createClient();

export default client;
