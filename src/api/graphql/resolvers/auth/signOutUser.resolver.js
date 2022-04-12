import analytics from "~services/analytics";
import { Success } from "~helpers/response";
import { LOGGED_OUT } from "~constants/i18n";
import { AUTH_KEY_PREFIX } from "~constants/auth";

export default {
  Mutation: {
    async signOutUser(_parent, { id }, { cache, t, jwt }) {
      // delete session
      await Promise.all(
        jwt.audience.map((aud) => cache.remove(`${aud}:${id}`))
      );
      await cache.remove(`${AUTH_KEY_PREFIX}:${id}`);
      analytics.track({
        event: "Logged Out",
        properties: {
          id,
        },
      });

      return Success({
        message: t(LOGGED_OUT),
        code: LOGGED_OUT,
      });
    },
  },
};
