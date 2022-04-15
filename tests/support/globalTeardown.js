import db from "~db/models";
import cache from "~utils/cache";

const globalTeardown = async () => {
  await db.sequelize.close();
  await cache.close();
};

export default globalTeardown;
