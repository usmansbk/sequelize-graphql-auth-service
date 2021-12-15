import { ValidationError, UniqueConstraintError } from "sequelize";
import sendMail from "~services/mailer";
import FieldErrors from "~utils/errors/FieldErrors";
import MutationError from "~utils/errors/MutationError";
import { formatErrors } from "~utils/errors/formatErrors";
import { INCORRECT_EMAIL_OR_PASSWORD, SIGNUP_FAILED } from "~helpers/constants";
import SequelizeDataSource from "./SequelizeDataSource";

export default class UserDS extends SequelizeDataSource {
  async currentUser() {
    return this.findByPk(this.context.userInfo?.id);
  }

  async findByEmailAndPassword({ email, password }) {
    const user = await this.findOne({
      where: {
        email,
      },
    });

    if (user && (await user.checkPassword(password))) {
      return user.toJSON();
    }

    throw new MutationError(INCORRECT_EMAIL_OR_PASSWORD);
  }

  async createWithEmail(fields) {
    const { jwt, locale } = this.context;
    try {
      let user = await this.create(fields);

      const expiresIn = 5; // minutes
      const verificationToken = jwt.sign({ verify: user.id }, `${expiresIn}m`);

      sendMail({
        template: "verify_email",
        message: {
          to: user.email,
        },
        locals: {
          locale: user.language || locale,
          name: user.firstName,
          link: `/verify_email?token=${verificationToken}`,
          expiresIn,
        },
      });

      return user.toJSON();
    } catch (e) {
      if (e instanceof ValidationError || e instanceof UniqueConstraintError) {
        const cause = new FieldErrors(
          e.message,
          formatErrors(e.errors, locale)
        );
        throw new MutationError(SIGNUP_FAILED, cause);
      } else {
        throw e;
      }
    }
  }
}
