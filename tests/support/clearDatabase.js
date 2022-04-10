import db from "~db/models";
import store from "~utils/store";

afterAll(async () => {
  await store.clearAll();
  store.close();
  await db.sequelize.close();
});
