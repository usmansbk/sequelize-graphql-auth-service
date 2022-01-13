import { Ok } from "~helpers/response";
import { LOGGED_OUT } from "~helpers/constants/i18n";

export default {
  Mutation: {
    // Log out is idempotent
    async logout(_, _args, { store, t, accessToken, jwt, clientId }) {
      if (accessToken) {
        const userInfo = jwt.decode(accessToken);

        // No refresh token means the user never logged in
        await store.remove(`${userInfo.sub}:${clientId}`);
      }

      return Ok({
        message: t(LOGGED_OUT),
      });
    },
  },
};
