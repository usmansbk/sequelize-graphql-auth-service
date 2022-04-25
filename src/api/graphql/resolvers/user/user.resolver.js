import QueryError from "~utils/errors/QueryError";
import { Fail, Success } from "~helpers/response";
import { USER_NOT_FOUND } from "~constants/i18n";

export default {
  User: {
    async avatar(user) {
      if (user.avatar === undefined) {
        return user.getAvatar();
      }
      return user.avatar;
    },
    isOwner(user, _args, { currentUser }) {
      return user.id === currentUser?.id;
    },
    async isLoggedIn(user, _args, { cache, jwt }) {
      const value = await Promise.all(
        jwt.audience.map((aud) => cache.get(`${aud}:${user.id}`))
      );
      return value.some((session) => !!session);
    },
    roles(user) {
      if (user.roles === undefined) {
        return user.getRoles();
      }
      return user.roles;
    },
  },
  Query: {
    async me(_parent, _args, { t, currentUser, dataSources }, info) {
      try {
        const user = await dataSources.users.findOne({
          where: { id: currentUser.id },
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
