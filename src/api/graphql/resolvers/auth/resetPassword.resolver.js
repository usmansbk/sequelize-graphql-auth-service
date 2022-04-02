import QueryError from "~utils/errors/QueryError";
import { Fail, Success } from "~helpers/response";
import { INVALID_LINK, PASSWORD_CHANGED } from "~constants/i18n";
import { PASSWORD_KEY_PREFIX } from "~constants/auth";

export default {
  Mutation: {
    async resetPassword(
      _parent,
      { input: { password, token } },
      { dataSources, store, t, jwt }
    ) {
      try {
        const { sub } = jwt.verify(token);
        const key = `${PASSWORD_KEY_PREFIX}:${sub}`;
        const expectedToken = await store.get(key);

        if (token !== expectedToken) {
          // we can report suspicious activity here
          throw new QueryError(INVALID_LINK);
        }

        await dataSources.users.update(sub, { password, emailVerified: true });

        await store.remove(key);

        // invalidate all refresh tokens
        await Promise.all(
          jwt.audience.map((aud) => store.remove(`${aud}:${sub}`))
        );

        // we can send an email here to inform user of the change...

        return Success({
          message: t(PASSWORD_CHANGED),
          code: PASSWORD_CHANGED,
        });
      } catch (e) {
        if (e instanceof QueryError) {
          return Fail({
            message: t(e.message),
            errors: e.errors,
          });
        }

        throw e;
      }
    },
  },
};
