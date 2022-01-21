import db from "~db/models";

const { sequelize } = db;

const dropTestDatabase = async () => {
  await sequelize.drop();
  await sequelize.close();
};

const globalTeardown = async () => {
  await dropTestDatabase();
};

export default globalTeardown;
