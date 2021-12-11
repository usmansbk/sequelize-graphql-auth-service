import db from "~db/models";

const { sequelize } = db;

export default async function globalSetup() {
  await sequelize.sync({ force: true });
}
