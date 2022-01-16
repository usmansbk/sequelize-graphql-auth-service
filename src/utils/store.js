import redis from "~services/redis";

const set = ({ key, value, expiresIn }) => redis.setex(key, expiresIn, value);

const get = (key) => redis.get(key);

const remove = (key) => redis.del(key);

export default {
  set,
  get,
  remove,
};
