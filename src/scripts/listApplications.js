/* eslint-disable no-console */
import db from "~db/models";
import log from "~utils/logger";

const { sequelize, Application } = db;

const listApplications = async () => {
  try {
    await sequelize.sync();
    const apps = await Application.findAll();

    console.log("*********************************************");
    apps.forEach((app) => console.log(app.name, ":", app.clientID));

    await sequelize.close();
  } catch (e) {
    log.error(e);
  }
};

listApplications();
