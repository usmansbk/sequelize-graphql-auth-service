import createRedisServer from "~config/redis";

const redis = createRedisServer();

const setValue = ({ key, value, expiresIn }) =>
  redis.setex(key, expiresIn, value);

export default {
  setValue,
};
