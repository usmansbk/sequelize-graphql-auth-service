import analytics from "~services/analytics";
import { Success } from "~helpers/response";
import { LOGGED_OUT } from "~helpers/constants/responseCodes";

export default {
  Mutation: {
    async signOutUser(_parent, { id }, { cache, t, jwt }) {
      // delete session
      await Promise.all(
        jwt.audience.map((aud) => cache.remove(`${aud}:${id}`))
      );
      analytics.track({
        userId: id,
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
