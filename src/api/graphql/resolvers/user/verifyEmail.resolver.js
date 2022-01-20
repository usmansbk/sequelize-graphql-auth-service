import { Fail, Success } from "~helpers/response";
import { EMAIL_VERIFIED, INVALID_LINK } from "~helpers/constants/i18n";
import QueryError from "~utils/errors/QueryError";
import { EMAIL_VERIFICATION_KEY_PREFIX } from "~helpers/constants/auth";

export default {
  Mutation: {
    async verifyEmail(_parent, { token }, { dataSources, store, t, jwt }) {
      try {
        const { sub: id } = jwt.verify(token);
        const key = `${EMAIL_VERIFICATION_KEY_PREFIX}:${id}`;

        const expectedToken = await store.get(key);

        if (token !== expectedToken) {
          throw new QueryError(INVALID_LINK);
        }

        const user = await dataSources.users.verifyEmail(id);

        await store.remove(key);

        // TODO: send an official welcome email here...

        return Success({
          message: t(EMAIL_VERIFIED),
          user,
        });
      } catch (e) {
        if (e instanceof QueryError) {
          return Fail({
            message: t(e.message),
          });
        }

        throw e;
      }
    },
  },
};
