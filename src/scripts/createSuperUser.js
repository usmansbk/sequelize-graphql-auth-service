import db from "~db/models";
import log from "~utils/logger";
import store from "~utils/store";
import { PERMISSIONS_ALIAS } from "~constants/models";

const permissions = [
  {
    name: "Root",
    action: "all",
    resource: "all",
    description:
      "For administrative purposes, and has the highest access rights in the organisation.",
  },
];

const { sequelize, User, Role } = db;
const createSuperUser = async () => {
  try {
    await sequelize.sync({ force: true });
    const role = await Role.create(
      {
        name: "ADMIN",
        description: "Admin group",
        permissions,
      },
      {
        include: [
          {
            association: PERMISSIONS_ALIAS,
          },
        ],
      }
    );
    const admin = await User.create({
      email: "usmansbk.dev@gmail.com",
      firstName: "Usman",
      lastName: "Suleiman",
      username: "usman",
      password: "qwertyadmin48",
    });
    await admin.addRole(role);
    await sequelize.close();
    store.close();
  } catch (e) {
    log.error(e);
  }
};

createSuperUser();
