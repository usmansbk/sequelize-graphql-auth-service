/* eslint-disable no-console */
import "dotenv/config";
import inquirer from "inquirer";
import db from "~db/models";
import log from "~utils/logger";
import Sentry from "~services/sentry";

const { sequelize, User, Role, Permission } = db;

const createRootUser = async () => {
  console.log(
    "WARNING: The root account has virtually unlimited access to all resources."
  );

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
    await sequelize.sync();
    await sequelize.transaction(async (t) => {
      const [permission] = await Permission.findOrCreate({
        where: { scope: "all" },
        defaults: {
          name: "GrantAll",
          description:
            "For administrative purposes, and has the highest access rights in the organisation.",
        },
        transaction: t,
      });
      const [role] = await Role.findOrCreate({
        where: { name: "root" },
        defaults: {
          description: "For administrative purposes",
        },
        transaction: t,
      });
      await role.addPermission(permission, { transaction: t });
      const user = await User.create(answers, { transaction: t });
      await user.addRole(role, { transaction: t });
    });
    await sequelize.close();
  } catch (err) {
    Sentry.captureException(err);
    log.error({ err });
  }
};

createRootUser();
