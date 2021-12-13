import db from "~db/models";
import redis from "~services/redis";

const { sequelize } = db;

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  redis.disconnect();
  await sequelize.close();
});
