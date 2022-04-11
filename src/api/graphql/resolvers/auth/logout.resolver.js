import { Success } from "~helpers/response";
import { LOGGED_OUT } from "~constants/i18n";
import analytics from "~services/analytics";

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
          analytics.track({
            userId: sub,
            event: "Logged Out",
            properties: {
              client: "all",
            },
          });
        } else {
          await cache.remove(`${clientId}:${sub}`);
          analytics.track({
            userId: sub,
            event: "Logged Out",
            properties: {
              client: clientId,
            },
          });
        }
      }

      return Success({
        message: t(LOGGED_OUT),
        code: LOGGED_OUT,
      });
    },
  },
};
