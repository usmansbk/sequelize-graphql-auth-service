import db from "~db/models";
import cache from "~utils/cache";

afterEach(async function () {
  await cache.clearAll();
});

afterAll(async function () {
  await db.sequelize.close();
});
