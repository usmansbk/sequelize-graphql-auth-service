import SequelizeDataSource from "./SequelizeDataSource";

export default class UserDS extends SequelizeDataSource {
  async createWithEmail(data) {
    const [user, created] = await this.findOrCreate({
      where: {
        email: data.email,
      },
      defaults: data,
    });

    return [user, created];
  }
}
