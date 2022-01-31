import store from "~utils/store";
import db from "~db/models";

const { sequelize } = db;

const dropTestDatabaseTables = async () => {
  await sequelize.drop();
  await sequelize.close();
};

const dropTestStore = async () => {
  await store.clearAll();
  store.close();
};

const globalTeardown = async () => {
  await dropTestDatabaseTables();
  await dropTestStore();
};

export default globalTeardown;
