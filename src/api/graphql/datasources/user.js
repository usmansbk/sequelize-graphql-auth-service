import SequelizeDataSource from "./SequelizeDataSource";

export default class UserDS extends SequelizeDataSource {
  currentUser() {
    return this.findByPk(this.context.userInfo?.sub);
  }

  async findByEmailAndPassword({ email, password }) {
    const user = await this.findOne({
      where: {
        email,
      },
    });

    if (user && (await user.checkPassword(password))) {
      return user;
    }

    return null;
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
    return this.update(this.context.userInfo.sub, fields);
  }

  verifyEmail(id) {
    return this.update(id, { emailVerified: true });
  }

  verifyPhoneNumber(id) {
    return this.update(id, { phoneNumberVerified: true });
  }
}
