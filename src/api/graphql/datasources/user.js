import { nanoid } from "nanoid";
import { ROLES_ALIAS } from "~helpers/constants/models";
import SequelizeDataSource from "./SequelizeDataSource";

export default class UserDS extends SequelizeDataSource {
  currentUser() {
    return this.findByPk(this.context.tokenInfo?.sub);
  }

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
            name: ["EMPLOYEE", "ADMIN"],
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
      defaults: {
        ...defaults,
        password: nanoid(16),
      },
    });
  }

  onDestroy({ oldImage }) {
    if (oldImage.avatar) {
      this.context.files.remove(oldImage.avatar);
    }
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
      await user.destroy();
    }

    user = await this.create(fields);

    return user;
  }

  updatePassword({ id, password }) {
    // updating a password is proof user owns an email
    return this.update(id, { password, emailVerified: true });
  }

  updateCurrentUser(fields) {
    return this.update(this.context.tokenInfo.sub, fields);
  }

  verifyEmail(id) {
    return this.update(id, { emailVerified: true });
  }

  verifyPhoneNumber(id) {
    return this.update(id, { phoneNumberVerified: true });
  }

  async deleteAvatar(id) {
    const user = await this.findByPk(id);

    if (user?.avatar) {
      this.context.files.remove(user.avatar);
    }

    return this.update(id, { avatar: null });
  }
}
