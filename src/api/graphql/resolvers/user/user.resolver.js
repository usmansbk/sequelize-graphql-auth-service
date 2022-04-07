import QueryError from "~utils/errors/QueryError";
import { Fail, Success } from "~helpers/response";
import { USER_NOT_FOUND } from "~constants/i18n";

export default {
  User: {
    picture(user) {
      return user.avatar;
    },
    isOwner(user, _args, { currentUser }) {
      return user.id === currentUser?.id;
    },
    /**
     * Fields aren't eager-loaded when we run Sequelize `Model.update`
     * In such case, we want to fallback to lazy-loading
     */
    roles(user) {
      return user.roles || user.getRoles();
    },
  },
  Query: {
    async me(_parent, _args, { t, currentUser }) {
      try {
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
    async getUserById(_parent, { id }, { dataSources, t }, info) {
      try {
        const user = await dataSources.users.findOne({
          where: { id },
          info,
          path: "user",
        });

        if (!user) {
          throw new QueryError(USER_NOT_FOUND);
        }

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
