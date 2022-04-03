import { Fail, Success } from "~helpers/response";
import QueryError from "~utils/errors/QueryError";
import { USER_DOES_NOT_EXIST } from "~constants/i18n";
import buildIncludeQuery from "~utils/include";

export default {
  Query: {
    async getUserById(_parent, { id }, { dataSources, t }, info) {
      try {
        const user = await dataSources.users.findOne({
          where: { id },
          include: buildIncludeQuery({
            info,
            fieldName: "user",
          }),
        });

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
