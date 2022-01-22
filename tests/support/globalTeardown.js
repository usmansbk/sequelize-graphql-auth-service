import db from "~db/models";

const { sequelize } = db;

const dropTestDatabaseTables = async () => {
  await sequelize.drop();
  await sequelize.close();
};

const globalTeardown = async () => {
  await dropTestDatabaseTables();
};

export default globalTeardown;
