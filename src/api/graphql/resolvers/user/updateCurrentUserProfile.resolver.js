import QueryError from "~utils/errors/QueryError";
import { PROFILE_UPDATED } from "~constants/i18n";
import { Fail, Success } from "~helpers/response";

export default {
  Mutation: {
    async updateCurrentUserFullname(_parent, { input }, { dataSources, t }) {
      try {
        const user = await dataSources.users.updateCurrentUser(input);

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
    async updateCurrentUserName(_parent, { username }, { dataSources, t }) {
      try {
        const user = await dataSources.users.updateCurrentUser({ username });

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
    async updateCurrentUserLocale(_parent, { locale }, { dataSources, t }) {
      try {
        const user = await dataSources.users.updateCurrentUser({ locale });

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
  },
};
