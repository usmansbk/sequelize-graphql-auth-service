import analytics from "~services/analytics";
import { Success } from "~helpers/response";
import { LOGGED_OUT } from "~constants/i18n";
import { AUTH_KEY_PREFIX } from "~constants/auth";

export default {
  Mutation: {
    // Log out is idempotent
    async logout(_parent, { all }, { cache, t, accessToken, jwt, clientId }) {
      if (accessToken) {
        const { sub } = jwt.decode(accessToken);

        // delete session
        if (all) {
          await Promise.all(
            jwt.audience.map((aud) => cache.remove(`${aud}:${sub}`))
          );
        } else {
          await cache.remove(`${clientId}:${sub}`);
        }
        await cache.remove(`${AUTH_KEY_PREFIX}:${sub}`);
        analytics.track({
          userId: sub,
          event: "Logged Out",
        });
      }

      return Success({
        message: t(LOGGED_OUT),
        code: LOGGED_OUT,
      });
    },
  },
};
