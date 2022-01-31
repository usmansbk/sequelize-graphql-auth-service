import redis from "~services/redis";

const client = redis.createClient();

const set = ({ key, value, expiresIn }) => client.setex(key, expiresIn, value);

const get = (key) => client.get(key);

const remove = (key) => client.del(key);

const increment = (key) => client.incr(key);

const clearAll = () => client.flushall();

const close = () => client.disconnect();

export default {
  set,
  get,
  remove,
  increment,
  clearAll,
  close,
};
