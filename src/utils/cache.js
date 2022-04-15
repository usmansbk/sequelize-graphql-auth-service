import client from "~services/redis";
import dayjs from "~utils/dayjs";

const set = (key, value, expiresIn = "5 minutes") => {
  const [time, units] = expiresIn.split(" ");
  const exp = dayjs.duration(Number.parseInt(time, 10), units).asSeconds();

  return client.setex(key, exp, value);
};

const exists = (key) => client.exists(key);

const get = (key) => client.get(key);

const getAndDelete = (key) => client.getdel(key);

const remove = (...args) => client.del(...args);

const increment = (key) => client.incr(key);

const clearAll = () => client.flushall();

const close = () => client.quit();

const setHash = (key, obj) => client.hmset(key, obj);

const getHash = (key) => client.hgetall(key);

const getHashField = (key, field) => client.hget(key, field);

const setJSON = (key, obj, expiresIn) =>
  set(key, JSON.stringify(obj), expiresIn);

const getJSON = async (key) => {
  const value = await get(key);

  if (value) {
    return JSON.parse(value);
  }
  return value;
};

export default {
  set,
  exists,
  get,
  getAndDelete,
  remove,
  increment,
  clearAll,
  close,
  setHash,
  getHash,
  getHashField,
  setJSON,
  getJSON,
};
