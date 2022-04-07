import QueryError from "~utils/errors/QueryError";
import { PROFILE_UPDATED } from "~constants/i18n";
import { Fail, Success } from "~helpers/response";

export default {
  Mutation: {
    async updateCurrentUserFullname(_parent, { input }, { currentUser, t }) {
      try {
        const user = await currentUser.cache().update(input);

        return Success({
          code: PROFILE_UPDATED,
          message: t(PROFILE_UPDATED),
          user,
        });
      } catch (e) {
        if (e instanceof QueryError) {
          return Fail({
            message: t(e.message),
            code: e.code,
            errors: e.errors,
          });
        }
        throw e;
      }
    },
    async updateCurrentUserName(_parent, { username }, { currentUser, t }) {
      try {
        const user = await currentUser.cache().update({ username });

        return Success({
          code: PROFILE_UPDATED,
          message: t(PROFILE_UPDATED),
          user,
        });
      } catch (e) {
        if (e instanceof QueryError) {
          return Fail({
            message: t(e.message),
            code: e.code,
            errors: e.errors,
          });
        }
        throw e;
      }
    },
    async updateCurrentUserLocale(_parent, { locale }, { currentUser, t }) {
      try {
        const user = await currentUser.cache().update({ locale });

        return Success({
          code: PROFILE_UPDATED,
          message: t(PROFILE_UPDATED),
          user,
        });
      } catch (e) {
        if (e instanceof QueryError) {
          return Fail({
            message: t(e.message),
            code: e.code,
            errors: e.errors,
          });
        }
        throw e;
      }
    },
    async removeCurrentUserProfilePicture(
      _parent,
      _args,
      { currentUser, t, dataSources }
    ) {
      try {
        const avatar = await currentUser.getAvatar();
        if (avatar) {
          await dataSources.files.destroy(avatar.id);
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
