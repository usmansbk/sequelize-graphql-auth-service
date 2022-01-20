import { nanoid } from "nanoid";
import emailTemplates from "~helpers/emailTemplates";
import sendMail from "~services/email";
import {
  FAILED_LOGIN_ATTEMPT_KEY_PREFIX,
  MAX_LOGIN_ATTEMPTS,
} from "~helpers/constants/auth";
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

    const { store, locale } = this.context;
    const attemptCountKey = `${FAILED_LOGIN_ATTEMPT_KEY_PREFIX}:${email}`;

    if (user && (await user.checkPassword(password))) {
      await store.remove(attemptCountKey);
      return user;
    }

    if (user) {
      const attempts = await store.increment(attemptCountKey);
      if (attempts === MAX_LOGIN_ATTEMPTS) {
        sendMail({
          template: emailTemplates.FAILED_LOGIN,
          message: {
            to: email,
          },
          locals: {
            locale,
            name: user.firstName,
          },
        });
      }
    }

    return null;
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

  onDestroy(user) {
    if (user.avatarId) {
      this.context.dataSources.files.destroy(user.avatarId);
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

    if (user?.avatarId) {
      await this.context.dataSources.files.destroy(user.avatarId);
      await user.reload();
    }

    return user;
  }
}
