import db from "~db/models";

const globalSetup = async () => {
  await db.sequelize.sync({ force: true });
};

export default globalSetup;
