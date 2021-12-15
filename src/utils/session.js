import redis from "~config/redis";

export async function set(key, value) {
  await redis.set(key, value);
}

export async function clear() {
  await redis.flushall();
}

export function end() {
  redis.disconnect();
}

export default {
  set,
  clear,
  end,
};
