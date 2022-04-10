import db from "~db/models";
import store from "~utils/store";

beforeAll(async () => {
  await db.sequelize.sync();
});

afterAll(async () => {
  store.close();
  await store.clearAll();
  await db.sequelize.close();
});
