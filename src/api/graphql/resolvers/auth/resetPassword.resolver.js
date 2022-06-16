import QueryError from "~utils/errors/QueryError";
import { Fail, Success } from "~helpers/response";
import {
  INVALID_LINK,
  PASSWORD_CHANGED,
} from "~helpers/constants/responseCodes";
import { PASSWORD_KEY_PREFIX } from "~helpers/constants/auth";
import analytics from "~services/analytics";

export default {
  Mutation: {
    async resetPassword(
      _parent,
      { input: { password, token } },
      { dataSources, cache, t, jwt }
    ) {
      try {
        const { sub } = jwt.verify(token);
        const key = `${PASSWORD_KEY_PREFIX}:${sub}`;
        const expectedToken = await cache.getAndDelete(key);

        if (token !== expectedToken) {
          // we can report suspicious activity here
          throw new QueryError(INVALID_LINK);
        }

        await dataSources.users.update(sub, { password, emailVerified: true });

        // invalidate all refresh tokens
        await Promise.all(
          jwt.audience.map((cid) => cache.remove(`${cid}:${sub}`))
        );

        // we can send an email here to inform user of the change...

        analytics.track({
          userId: sub,
          event: "Reset Password",
        });

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
