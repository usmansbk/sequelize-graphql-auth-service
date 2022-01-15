import db from "~db/models";

const { sequelize } = db;

const globalTeardown = async () => {
  await sequelize.drop();
  await sequelize.close();
};

export default globalTeardown;
