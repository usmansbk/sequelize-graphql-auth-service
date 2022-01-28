import { Success } from "~helpers/response";
import { LOGGED_OUT } from "~helpers/constants/i18n";
import { allowedClients } from "~helpers/constants/auth";

export default {
  Mutation: {
    // Log out is idempotent
    async logout(_parent, { all }, { store, t, accessToken, jwt, clientId }) {
      if (accessToken) {
        const { sub } = jwt.decode(accessToken);

        // delete session
        if (all) {
          allowedClients.forEach((aud) => {
            store.remove(`${aud}:${sub}`);
          });
        } else {
          store.remove(`${clientId}:${sub}`);
        }
      }

      return Success({
        message: t(LOGGED_OUT),
      });
    },
  },
};
