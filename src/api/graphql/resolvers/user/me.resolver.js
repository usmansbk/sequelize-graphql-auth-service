import { Fail, Success } from "~helpers/response";
import QueryError from "~utils/errors/QueryError";

export default {
  Query: {
    async me(_parent, _args, { dataSources, t }) {
      try {
        const user = await dataSources.users.currentUser();

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
