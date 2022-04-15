import inquirer from "inquirer";
import db from "~db/models";
import log from "~utils/logger";
import { PERMISSIONS_ALIAS } from "~constants/models";

const permissions = [
  {
    name: "Root",
    scope: "all",
    description:
      "For administrative purposes, and has the highest access rights in the organisation.",
  },
];

const { sequelize, User, Role } = db;

const createSuperUser = async () => {
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
      const superUser = await Role.create(
        {
          name: "root",
          description: "For administrative purposes",
          permissions,
        },
        {
          include: [
            {
              association: PERMISSIONS_ALIAS,
            },
          ],
          transaction: t,
        }
      );
      const root = await User.create(answers, { transaction: t });
      await root.addRole(superUser, { transaction: t });
    });
    await sequelize.close();
  } catch (e) {
    log.error(e);
  }
};

createSuperUser();
