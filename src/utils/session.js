import redis from "~config/redis";

export async function set(key, value) {
  await redis.set(key, value);
}

export async function clearAll() {
  await redis.flushall();
}

export function end() {
  redis.disconnect();
}

export default {
  set,
  clearAll,
  end,
};
