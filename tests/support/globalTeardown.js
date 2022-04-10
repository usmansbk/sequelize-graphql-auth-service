import db from "~db/models";
import cache from "~utils/cache";

const { sequelize } = db;

const globalTeardown = async () => {
  await sequelize.close();
  cache.close();
};

export default globalTeardown;
