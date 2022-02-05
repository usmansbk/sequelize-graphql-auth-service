import db from "~db/models";
import log from "~utils/logger";

const { sequelize, User, Role } = db;
const createSuperUser = async () => {
  try {
    await sequelize.authenticate();
    const [role] = await Role.findOrCreate({
      where: { name: "ADMIN" },
      defaults: {
        description: "Admin group",
      },
    });
    const [user] = await User.findOrCreate({
      where: {
        username: "admin",
      },
      defaults: {
        email: "admin@@su.com",
        firstName: "Super",
        lastName: "User",
        password: "admin123",
      },
    });
    await user.addRole(role);
  } catch (e) {
    log.error(e);
  }
};

createSuperUser();
