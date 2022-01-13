import { BadRequest, Ok } from "~helpers/response";
import { EMAIL_VERIFIED, INVALID_LINK } from "~helpers/constants/i18n";
import QueryError from "~utils/errors/QueryError";

export default {
  Mutation: {
    async verifyEmail(_, { token }, { dataSources, store, t }) {
      try {
        const id = await store.get(token);

        if (!id) {
          throw new QueryError(INVALID_LINK);
        }

        const user = await dataSources.users.verifyEmail(id);

        await store.remove(token);

        return Ok({
          message: t(EMAIL_VERIFIED),
          user,
        });
      } catch (error) {
        if (error instanceof QueryError) {
          return BadRequest({
            message: t(error.message),
          });
        }

        throw error;
      }
    },
  },
};
