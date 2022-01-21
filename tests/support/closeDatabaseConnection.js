import db from "~db/models";

const { sequelize } = db;

afterAll(async () => {
  await sequelize.close();
});
