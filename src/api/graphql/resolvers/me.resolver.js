import { ForbiddenError } from "apollo-server-core";
import { BadRequest, Ok } from "~helpers/response";
import QueryError from "~utils/errors/QueryError";

export default {
  Query: {
    async me(_parent, _args, { dataSources, t }) {
      try {
        const user = await dataSources.users.currentUser();
        if (!user) {
          // a non existent user should not reach here
          throw new ForbiddenError();
        }

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
