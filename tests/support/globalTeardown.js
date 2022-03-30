import db from "~db/models";
import store from "~utils/store";

const { sequelize } = db;

const globalTeardown = async () => {
  await sequelize.close();
  store.close();
};

export default globalTeardown;
