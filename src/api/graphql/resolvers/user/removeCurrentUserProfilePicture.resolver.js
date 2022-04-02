import { Fail, Success } from "~helpers/response";
import QueryError from "~utils/errors/QueryError";

export default {
  Mutation: {
    async removeCurrentUserProfilePicture(
      _parent,
      _args,
      { currentUser, t, fileStorage }
    ) {
      try {
        if (currentUser.avatar) {
          fileStorage.remove(currentUser.avatar);
          await currentUser.cache().update({ avatar: null });
        }

        return Success({ user: currentUser });
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
