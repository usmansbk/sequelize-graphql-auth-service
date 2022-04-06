import { Fail, Success } from "~helpers/response";
import QueryError from "~utils/errors/QueryError";
import { USER_NOT_FOUND } from "~constants/i18n";
import { buildEagerLoadingQuery } from "~utils/transformers/eagerLoader";

export default {
  Query: {
    async getUserById(_parent, { id }, { dataSources, t }, info) {
      try {
        const user = await dataSources.users.findOne({
          where: { id },
          include: buildEagerLoadingQuery({
            info,
            model: dataSources.users.model,
            path: "user",
          }),
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
