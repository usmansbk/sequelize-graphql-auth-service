import { Fail, Success } from "~helpers/response";
import QueryError from "~utils/errors/QueryError";

export default {
  Query: {
    async getUser(_parent, { id }, { dataSources, t }) {
      try {
        const user = await dataSources.users.findByPk(id);

        return Success({ user });
      } catch (e) {
        if (e instanceof QueryError) {
          return Fail({
            message: t(e.message),
          });
        }
        throw e;
      }
    },
  },
};
