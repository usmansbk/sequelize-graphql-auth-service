import db from "~db/models";

const { sequelize } = db;

const globalSetup = async () => {
  await sequelize.sync({ force: true });
};

export default globalSetup;
