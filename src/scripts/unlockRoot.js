import "dotenv/config";
import inquirer from "inquirer";
import { AuthenticationError } from "apollo-server-core";
import db from "~db/models";
import log from "~utils/logger";
import Sentry from "~services/sentry";
import {
  ACCOUNT_STATUS,
  PERMISSIONS_ALIAS,
  ROLES_ALIAS,
} from "~helpers/constants/models";

const { sequelize, User } = db;

const unlockRoot = async () => {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "email",
      message: "Root user email",
    },
    {
      type: "password",
      name: "password",
      message: "Root user password",
    },
  ]);

  try {
    await sequelize.sync();
    await sequelize.transaction(async (t) => {
      const user = await User.findOne({
        where: {
          email: answers.email,
        },
        include: [
          {
            association: ROLES_ALIAS,
            include: [
              {
                association: PERMISSIONS_ALIAS,
                where: {
                  scope: "all",
                },
              },
            ],
          },
        ],
        transaction: t,
      });

      const granted = await user?.checkPassword(answers.password);

      if (!granted) {
        throw new AuthenticationError();
      }
      await user.update({ status: ACCOUNT_STATUS.ACTIVE }, { transaction: t });
      process.stdout.write(`User verified\n`);
    });
  } catch (err) {
    Sentry.captureException(err);
    log.error({ err });
  }
  await sequelize.close();
};

unlockRoot();
