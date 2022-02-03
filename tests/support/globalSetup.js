import db from "~db/models";

const { sequelize } = db;

const createTestDatabaseTables = async () => {
  await sequelize.sync({ force: false });
};

const globalSetup = async () => {
  await createTestDatabaseTables();
};

export default globalSetup;
