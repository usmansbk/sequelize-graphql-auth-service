import db from "~db/models";
import cache from "~utils/cache";

export default async function globalTeardown() {
  await db.sequelize.close();
  await cache.close();
}
