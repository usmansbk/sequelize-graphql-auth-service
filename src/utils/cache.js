import client from "~services/redis";

const set = ({ key, value, expiresIn }) => client.setex(key, expiresIn, value);

const get = (key) => client.get(key);

const getAndDelete = (key) => client.getdel(key);

const remove = (...args) => client.del(...args);

const increment = (key) => client.incr(key);

const clearAll = () => client.flushall();

const close = () => client.disconnect();

export default {
  set,
  get,
  getAndDelete,
  remove,
  increment,
  clearAll,
  close,
};
