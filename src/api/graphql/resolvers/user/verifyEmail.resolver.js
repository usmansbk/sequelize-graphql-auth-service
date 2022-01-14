import { BadRequest, Ok } from "~helpers/response";
import { EMAIL_VERIFIED, INVALID_LINK } from "~helpers/constants/i18n";
import QueryError from "~utils/errors/QueryError";
import { EMAIL_VERIFICATION_KEY_PREFIX } from "~helpers/constants/tokens";

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

        // Optionally, we can send an official welcome email here...

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
