import { BadRequest, Ok } from "~helpers/response";
import { ACCOUNT_DELETED, INVALID_LINK } from "~helpers/constants/i18n";
import QueryError from "~utils/errors/QueryError";

export default {
  Mutation: {
    async deleteAccount(_, { token }, { dataSources, store, t, jwt }) {
      try {
        const { sub } = jwt.verify(token);
        const expectedToken = await store.get(sub);

        if (token !== expectedToken) {
          // we can track the number of failed attempts here and lock the account
          throw new QueryError(INVALID_LINK);
        }

        await dataSources.users.destroy(sub);

        return Ok({
          message: t(ACCOUNT_DELETED),
        });
      } catch (error) {
        if (error instanceof QueryError) {
          return BadRequest({
            message: t(error.message),
            errors: error.cause?.errors,
          });
        }

        throw error;
      }
    },
  },
};
