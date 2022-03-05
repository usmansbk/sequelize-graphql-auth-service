import db from "~db/models";
import log from "~utils/logger";
import { PERMISSIONS_ALIAS, ROLES_ALIAS } from "~helpers/constants/models";

const permissions = [
  {
    name: "CreateRoles",
    action: "create",
    resource: "roles",
  },
  {
    name: "CreatePermissions",
    action: "create",
    resource: "permissions",
  },
  {
    name: "CreateUsers",
    action: "create",
    resource: "users",
  },
];

const { sequelize, User } = db;
const createSuperUser = async () => {
  try {
    await sequelize.authenticate();
    await User.create(
      {
        email: "admin@su.com",
        firstName: "Super",
        lastName: "User",
        username: "admin",
        password: "admin123",
        roles: [
          {
            name: "ADMIN",
            description: "Admin group",
            permissions,
          },
        ],
      },
      {
        include: [
          {
            association: ROLES_ALIAS,
            include: [
              {
                association: PERMISSIONS_ALIAS,
              },
            ],
          },
        ],
      }
    );
    await sequelize.close();
  } catch (e) {
    log.error(e);
  }
};

createSuperUser();
