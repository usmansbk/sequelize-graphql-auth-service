import db from "~db/models";
import session from "~utils/session";

const { sequelize } = db;

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  session.end();
  await sequelize.close();
});
