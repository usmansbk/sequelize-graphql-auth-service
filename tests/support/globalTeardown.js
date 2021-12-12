import db from "~db/models";

const { sequelize } = db;

export default async function globalTeardown() {
  await sequelize.drop();
  await sequelize.close();
}
