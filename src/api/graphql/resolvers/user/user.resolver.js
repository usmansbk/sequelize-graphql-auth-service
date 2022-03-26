import { Fail, Success } from "~helpers/response";
import QueryError from "~utils/errors/QueryError";

export default {
  User: {
    picture(parent) {
      return parent.avatar;
    },
    isOwner(parent, _args, { tokenInfo }) {
      return parent.id === tokenInfo?.sub;
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
    async users(_parent, _args, { dataSources }) {
      const items = await dataSources.users.findAll();
      const totalCount = items.length;

      return {
        items,
        totalCount,
      };
    },
  },
};
