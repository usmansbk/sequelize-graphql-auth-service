/* eslint-disable no-console */
import "dotenv/config";
import inquirer from "inquirer";
import db from "~db/models";
import cache from "~services/redis";
import log from "~utils/logger";
import Sentry from "~services/sentry";
import { CLIENTS_CACHE_KEY } from "~helpers/constants/auth";

const { sequelize, Application } = db;

const createApp = async () => {
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
    console.log("Client ID:", app.toJSON().clientID);
  } catch (err) {
    Sentry.captureException(err);
    log.error({ err });
  }
  cache.disconnect();
  await sequelize.close();
};

createApp();
