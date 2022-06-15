import inquirer from "inquirer";
import db from "~db/models";
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

    console.log("************************************************************");
    console.log("Application created. Your clientID is", app.toJSON().clientID);
    await sequelize.close();
  } catch (e) {
    log.error(e);
  }
};

createApplication();
