import { Fail, Success } from "~helpers/response";
import QueryError from "~utils/errors/QueryError";
import { USER_DOES_NOT_EXIST } from "~helpers/constants/i18n";

export default {
  Query: {
    async getUserById(_parent, { id }, { dataSources, t }) {
      try {
        const user = await dataSources.users.findByPk(id);

        if (!user) {
          throw new QueryError(USER_DOES_NOT_EXIST);
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
