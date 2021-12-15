import { ValidationError, UniqueConstraintError } from "sequelize";
import sendMail from "~services/mailer";
import FieldErrors from "~utils/errors/FieldErrors";
import MutationError from "~utils/errors/MutationError";
import { formatErrors } from "~utils/errors/formatErrors";
import { SIGNUP_FAILED } from "~helpers/constants";
import SequelizeDataSource from "./SequelizeDataSource";

export default class UserDS extends SequelizeDataSource {
  async createWithEmail(fields) {
    try {
      let user = await this.create(fields);

      const verificationToken = this.context.jwt.sign({
        id: user.id,
        type: "verification",
      });

      sendMail({
        template: "verifyEmail",
        message: {
          to: user.email,
        },
        locals: {
          name: user.firstName,
          link: `/verify-email?token=${verificationToken}`,
        },
      });

      return user.toJSON();
    } catch (e) {
      if (e instanceof ValidationError || e instanceof UniqueConstraintError) {
        const cause = new FieldErrors(
          e.message,
          formatErrors(e.errors, this.context.locale)
        );
        throw new MutationError(SIGNUP_FAILED, cause);
      } else {
        throw e;
      }
    }
  }
}
