import SequelizeDataSource from "./SequelizeDataSource";

export default class UserDS extends SequelizeDataSource {
  onError(error) {
    // format error
    super.onError(error);
  }

  async createWithEmail(fields) {
    let user = await this.create(fields);

    // send verification email

    return user;
  }
}
