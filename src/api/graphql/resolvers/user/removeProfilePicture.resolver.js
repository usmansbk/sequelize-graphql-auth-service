import { Fail, Success } from "~helpers/response";
import QueryError from "~utils/errors/QueryError";

export default {
  Mutation: {
    async removeProfilePicture(_parent, _args, { dataSources, t, tokenInfo }) {
      try {
        const user = await dataSources.users.deleteAvatar(tokenInfo.sub);

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
