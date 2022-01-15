import { BadRequest, Ok } from "~helpers/response";
import QueryError from "~utils/errors/QueryError";

export default {
  Mutation: {
    async removeProfilePicture(_parent, _args, { dataSources, t, tokenInfo }) {
      try {
        const user = await dataSources.users.deleteAvatar(tokenInfo.sub);

        return Ok({ user });
      } catch (e) {
        if (e instanceof QueryError) {
          return BadRequest({
            message: t(e.message),
          });
        }
        throw e;
      }
    },
  },
};
