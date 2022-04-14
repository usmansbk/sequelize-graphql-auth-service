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

const close = () => client.disconnect();

const setJSON = (key, obj) => client.hset(key, obj);

export default {
  set,
  exists,
  get,
  getAndDelete,
  remove,
  increment,
  clearAll,
  close,
  setJSON,
};
