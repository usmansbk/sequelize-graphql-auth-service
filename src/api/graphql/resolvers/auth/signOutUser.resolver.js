import analytics from "~services/analytics";
import { Success } from "~helpers/response";
import { LOGGED_OUT } from "~helpers/constants/responseCodes";

export default {
  Mutation: {
    async signOutUser(_parent, { id }, { cache, t, clients }) {
      // delete session
      await Promise.all(clients.map((cid) => cache.remove(`${cid}:${id}`)));
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
