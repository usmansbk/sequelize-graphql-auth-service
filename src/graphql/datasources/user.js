import { formatErrors, ValidationError } from "~utils/errors";
import SequelizeDataSource from "./SequelizeDataSource";

export default class UserDS extends SequelizeDataSource {
  onError(error) {
    let e = error;
    if (error.errors) {
      e = new ValidationError("createUserFailed", formatErrors(error.errors));
    }
    super.onError(e);
  }

  async createWithEmail(fields) {
    let user = await this.create(fields);

    return user.toJSON();
  }
}
