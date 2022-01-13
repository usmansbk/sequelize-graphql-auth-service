import { BadRequest, Ok } from "~helpers/response";
import { INVALID_LINK, PASSWORD_CHANGED } from "~helpers/constants/i18n";
import QueryError from "~utils/errors/QueryError";
import { supportedClients } from "~helpers/constants/tokens";

export default {
  Mutation: {
    async resetPassword(
      _,
      { input: { password, token } },
      { dataSources, store, t, jwt }
    ) {
      try {
        const { sub } = jwt.verify(token);
        const challenge = await store.get(sub);

        if (token !== challenge) {
          // we can track the number of failed attempts here and lock the account
          throw new QueryError(INVALID_LINK);
        }

        await dataSources.users.updatePassword({ id: sub, password });

        await store.remove(sub);

        // invalidate all refresh tokens
        supportedClients.forEach(async (clientId) => {
          await store.remove(`${sub}:${clientId}`);
        });

        // we can send an email to inform user of the change...

        return Ok({
          message: t(PASSWORD_CHANGED),
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
