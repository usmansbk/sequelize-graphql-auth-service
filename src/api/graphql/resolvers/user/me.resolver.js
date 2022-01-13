import { BadRequest, Ok } from "~helpers/response";
import QueryError from "~utils/errors/QueryError";

export default {
  Query: {
    async me(_parent, _args, { dataSources, t }) {
      try {
        const user = await dataSources.users.currentUser();

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
