/* eslint-disable no-console */
import "dotenv/config";
import inquirer from "inquirer";
import db from "~db/models";
import log from "~utils/logger";
import Sentry from "~services/sentry";

const { sequelize, User, Role, Permission } = db;

const createRoot = async () => {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "firstName",
      message: "First name",
    },
    {
      type: "input",
      name: "lastName",
      message: "Last name",
    },
    {
      type: "input",
      name: "username",
      message: "Username",
    },
    {
      type: "input",
      name: "email",
      message: "Email address",
    },
    {
      type: "password",
      name: "password",
      message: "Password (6 - 32 characters long)",
    },
  ]);
  try {
    sequelize.options.logging = false;
    await sequelize.sync();
    await sequelize.transaction(async (t) => {
      const [permission] = await Permission.findOrCreate({
        where: { scope: "all" },
        defaults: {
          description:
            "For administrative purposes, and has the highest access rights in the organisation.",
        },
        transaction: t,
      });
      console.log("Permission created");
      const [role] = await Role.findOrCreate({
        where: { name: "root" },
        defaults: {
          description: "For administrative purposes",
        },
        transaction: t,
      });
      console.log("Role created");
      await role.addPermission(permission, { transaction: t });
      console.log("Permission attached to Role");
      const user = await User.create(answers, { transaction: t });
      console.log("User created");
      await user.addRole(role, { transaction: t });
      console.log("Role attached to User");
    });
  } catch (err) {
    Sentry.captureException(err);
    log.error({ err });
  }
  await sequelize.close();
};

createRoot();
