import inquirer from "inquirer";
import db from "~db/models";
import { CLIENTS_CACHE_KEY } from "~helpers/constants/auth";
import client from "~services/redis";
import log from "~utils/logger";

const { sequelize, Application } = db;

const createApplication = async () => {
  console.log("Create Application:");

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Application name",
    },
    {
      type: "input",
      name: "description",
      message: "Description",
    },
  ]);
  try {
    await sequelize.sync();
    const app = await Application.create(answers);
    await client.del(CLIENTS_CACHE_KEY);
    client.disconnect();

    console.log("************************************************************");
    console.log("Application created. Your clientID is", app.toJSON().clientID);
    await sequelize.close();
  } catch (e) {
    log.error(e);
  }
};

createApplication();
