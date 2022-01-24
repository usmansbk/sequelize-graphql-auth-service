import db from "~db/models";

const { sequelize } = db;

const createTestDatabaseTables = async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
};

const globalSetup = async () => {
  await createTestDatabaseTables();
};

export default globalSetup;
