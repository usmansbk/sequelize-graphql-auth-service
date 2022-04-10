import { Success } from "~helpers/response";
import { LOGGED_OUT } from "~constants/i18n";

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
      }

      return Success({
        message: t(LOGGED_OUT),
        code: LOGGED_OUT,
      });
    },
  },
};
