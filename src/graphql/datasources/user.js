import { ValidationError, UniqueConstraintError } from "sequelize";
import sendMail from "~services/mailer";
import FieldErrors from "~utils/errors/FieldErrors";
import MutationError from "~utils/errors/MutationError";
import { formatErrors } from "~utils/errors/formatErrors";
import { SIGNUP_FAILED } from "~helpers/constants";
import SequelizeDataSource from "./SequelizeDataSource";

export default class UserDS extends SequelizeDataSource {
  async currentUser() {
    return this.findByPk(this.context.userInfo?.id);
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
          locale: user.locale || locale,
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
