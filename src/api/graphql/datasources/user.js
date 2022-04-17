import { ForbiddenError } from "apollo-server-core";
import { USER_PREFIX } from "~constants/auth";
import { ACCOUNT_STATUS, ROLES_ALIAS } from "~constants/models";
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
          where: {
            name: ["root", "admin"],
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
      if (
        [ACCOUNT_STATUS.BLOCKED, ACCOUNT_STATUS.LOCKED].includes(user.status)
      ) {
        throw new ForbiddenError(user.status);
      }
      await this.destroy(user.id);
    }

    user = await this.create(fields);

    return user;
  }

  async onUpdate(args) {
    await this.context.cache.remove(`${USER_PREFIX}:${args.oldImage.id}`);
    super.onUpdate(args);
  }
}
