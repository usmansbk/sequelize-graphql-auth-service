import { Fail, Success } from "~helpers/response";
import QueryError from "~utils/errors/QueryError";
import db from "~db/models";

const { sequelize } = db;
export default {
  Mutation: {
    async removeCurrentUserProfilePicture(
      _parent,
      _args,
      { currentUser, t, fileStorage }
    ) {
      try {
        const user = await sequelize.transaction(async () => {
          const avatar = currentUser?.avatar;

          const updates = [currentUser.cache().update({ avatar: null })];

          if (avatar) {
            updates.push(fileStorage.remove(user.avatar));
          }

          const [updatedUser] = await Promise.all(updates);

          return updatedUser;
        });

        return Success({ user });
      } catch (e) {
        if (e instanceof QueryError) {
          return Fail({
            message: t(e.message),
            code: e.code,
          });
        }
        throw e;
      }
    },
  },
};
