import db from "~db/models";
import store from "~utils/store";

afterEach(async () => {
  await store.clearAll();
});

afterAll(async () => {
  await db.sequelize.close();
});
