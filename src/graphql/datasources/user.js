import { ValidationError } from "~utils/errors";
import SequelizeDataSource from "./SequelizeDataSource";

export default class UserDS extends SequelizeDataSource {
  onError(error) {
    let e = error;
    if (error.errors) {
      const formattedErrors = error.errors.map(({ path, message }) => ({
        field: path,
        message,
      }));

      e = new ValidationError("createUserFailed", formattedErrors);
    }
    super.onError(e);
  }

  async createWithEmail(fields) {
    let user = await this.create(fields);

    // send verification email

    return user;
  }
}
