import db from "~db/models";

export default async function globalSetup() {
  await db.sequelize.sync({ force: true });
}
