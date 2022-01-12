import { ValidationError, UniqueConstraintError } from "sequelize";
import FieldErrors from "~utils/errors/FieldErrors";
import QueryError from "~utils/errors/QueryError";
import { formatErrors } from "~utils/errors/formatErrors";
import {
  BANNED_STATUS,
  INCORRECT_EMAIL_OR_PASSWORD,
  SIGNUP_FAILED,
} from "~helpers/constants/i18n";
import SequelizeDataSource from "./SequelizeDataSource";

export default class UserDS extends SequelizeDataSource {
  async currentUser() {
    const user = await this.findByPk(this.context.userInfo?.id);
    if (user.status === BANNED_STATUS) {
      throw new QueryError(BANNED_STATUS);
    }

    return user;
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

    throw new QueryError(INCORRECT_EMAIL_OR_PASSWORD);
  }

  async createWithEmail(fields) {
    try {
      let user = await this.findOne({
        where: {
          email: fields.email,
        },
      });

      /**
       * SCENARIO:
       * When someone tries to register with my email,
       * I would not like to be asked to reset my email when I've never registered before.
       *
       * SOLUTION:
       * So, we consider unverified emails as temporary accounts with limited access to service or
       * prevent them from all access until email is verified.
       */
      if (user && !user.emailVerified) {
        await user.destroy();
      }

      user = await this.create(fields);

      return user;
    } catch (e) {
      if (e instanceof ValidationError || e instanceof UniqueConstraintError) {
        const cause = new FieldErrors(
          e.message,
          formatErrors(e.errors, this.context.t)
        );
        throw new QueryError(SIGNUP_FAILED, cause);
      } else {
        throw e;
      }
    }
  }
}
