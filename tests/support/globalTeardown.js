import db from "~db/models";

const { sequelize } = db;

const clearDatabase = async () => {
  await sequelize.drop();
  await sequelize.close();
};

const globalTeardown = async () => {
  await clearDatabase();
};

export default globalTeardown;
