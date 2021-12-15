import db from "~db/models";
import session from "~utils/session";

const { sequelize } = db;

export default async function globalTeardown() {
  await session.clear();
  session.end();
  await sequelize.drop();
  await sequelize.close();
}
