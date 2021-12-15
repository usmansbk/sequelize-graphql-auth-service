import db from "~db/models";
import redis from "~config/redis";

const { sequelize } = db;

export default async function globalTeardown() {
  await redis.flushall();
  redis.disconnect();
  await sequelize.drop();
  await sequelize.close();
}
