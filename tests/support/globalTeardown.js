import db from "~db/models";
import cache from "~utils/cache";

const globalTeardown = async () => {
  await db.sequelize.close();
  cache.close();
};

export default globalTeardown;
