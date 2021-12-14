import { ValidationError, UniqueConstraintError } from "sequelize";
import sendMail from "~services/mailer";
import { SIGNUP_FAILED } from "~helpers/constants";
import FieldErrors from "~utils/errors/FieldErrors";
import MutationError from "~utils/errors/MutationError";
import SequelizeDataSource from "./SequelizeDataSource";

export default class UserDS extends SequelizeDataSource {
  onError(e) {
    if (e instanceof ValidationError || e instanceof UniqueConstraintError) {
      const cause = new FieldErrors(SIGNUP_FAILED, e.errors, this.context.t);
      throw new MutationError(e.message, cause);
    }
    throw e;
  }

  async createWithEmail(fields) {
    let user = await this.create(fields);

    sendMail({
      to: user.email,
      subject: "Welcome",
      text: "Welcome",
      html: "<h1>Welcome</h1>",
    });

    return user.toJSON();
  }
}
