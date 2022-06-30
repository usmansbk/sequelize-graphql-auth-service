/* eslint-disable no-console */
import "dotenv/config";
import inquirer from "inquirer";
import db from "~db/models";
import cache from "~services/redis";
import log from "~utils/logger";
import Sentry from "~services/sentry";
import { CLIENTS_CACHE_KEY } from "~helpers/constants/auth";

const { sequelize, Application } = db;

const createApplication = async () => {
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
    await sequelize.authenticate();
    const app = await Application.create(answers);
    await cache.del(CLIENTS_CACHE_KEY);
    cache.disconnect();
    console.log("Client ID:", app.toJSON().clientID);
    await sequelize.close();
  } catch (err) {
    Sentry.captureException(err);
    log.error({ err });
  }
};

createApplication();
