import { USER_PREFIX } from "~constants/auth";
import SequelizeDataSource from "./SequelizeDataSource";

export default class UserDS extends SequelizeDataSource {
  findOrCreate({ email, ...defaults }) {
    return super.findOrCreate({
      where: { email },
      defaults,
    });
  }

  async onUpdate(args) {
    await this.context.cache.remove(`${USER_PREFIX}:${args.oldImage.id}`);
    super.onUpdate(args);
  }
}
