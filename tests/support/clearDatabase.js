import db from "~db/models";
import cache from "~utils/cache";

afterEach(async () => {
  await cache.clearAll();
});

afterAll(async () => {
  await db.sequelize.close();
});
