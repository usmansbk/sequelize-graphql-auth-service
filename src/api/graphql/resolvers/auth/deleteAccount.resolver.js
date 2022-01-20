import QueryError from "~utils/errors/QueryError";
import { Fail, Success } from "~helpers/response";
import { ACCOUNT_DELETED, INVALID_LINK } from "~helpers/constants/i18n";
import { DELETE_ACCOUNT_KEY_PREFIX } from "~helpers/constants/auth";

export default {
  Mutation: {
    async deleteAccount(_parent, { token }, { dataSources, store, t, jwt }) {
      try {
        const { sub } = jwt.verify(token);
        const key = `${DELETE_ACCOUNT_KEY_PREFIX}:${sub}`;
        const expectedToken = await store.get(key);

        if (token !== expectedToken) {
          throw new QueryError(INVALID_LINK);
        }

        await dataSources.users.destroy(sub);

        return Success({
          message: t(ACCOUNT_DELETED),
        });
      } catch (e) {
        if (e instanceof QueryError) {
          return Fail({
            message: t(e.message),
            errors: e.errors,
            code: e.code,
          });
        }

        throw e;
      }
    },
  },
};
