import QueryError from "~utils/errors/QueryError";
import { Fail, Success } from "~helpers/response";
import { PERMISSION_NOT_FOUND } from "~constants/i18n";

export default {
  Query: {
    async getPermissionById(_parent, { id }, { dataSources, t }, info) {
      try {
        const permission = await dataSources.permissions.findOne({
          where: { id },
          info,
          path: "permission",
        });

        if (!permission) {
          throw new QueryError(PERMISSION_NOT_FOUND);
        }

        return Success({ permission });
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
