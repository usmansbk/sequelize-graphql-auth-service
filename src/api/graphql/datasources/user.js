import { ROLES_ALIAS } from "~constants/models";
import SequelizeDataSource from "./SequelizeDataSource";

export default class UserDS extends SequelizeDataSource {
  async findByEmailAndPassword({ email, password }) {
    const user = await this.findOne({
      where: {
        email,
      },
    });

    const granted = await user?.checkPassword(password);

    return [user, granted];
  }

  async findAdminByUsernameAndPassword({ username, password }) {
    const user = await this.findOne({
      where: {
        username,
      },
      include: [
        {
          association: ROLES_ALIAS,
          required: true,
          where: {
            name: ["STAFF", "ADMIN"],
          },
        },
      ],
    });

    const granted = await user?.checkPassword(password);

    return [user, granted];
  }

  findOrCreate({ email, ...defaults }) {
    return super.findOrCreate({
      where: { email },
      defaults,
    });
  }

  async createWithEmail(fields) {
    let user = await this.findOne({
      where: {
        email: fields.email,
      },
    });

    /**
     * SCENARIO:
     * When someone tries to register with my email,
     * I would not like to be asked to reset my email because I've never registered before.
     *
     * SOLUTION:
     * We consider unverified emails as temporary accounts with limited or no access to service
     * until verified
     */
    if (user && !user.emailVerified) {
      await this.destroy(user.id);
    }

    user = await this.create(fields);

    return user;
  }
}
