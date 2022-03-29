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
    roles(parent) {
      return parent.getRoles();
    },
  },
  Query: {
    async me(_parent, _args, { t, currentUser, dataSources }) {
      try {
        const user = await dataSources.users.findByPk(currentUser.id); // get updated user
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
    users(_parent, { page }, { dataSources }) {
      return dataSources.users.paginate(page);
    },
  },
};
