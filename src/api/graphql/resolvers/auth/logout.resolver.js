import { Ok } from "~helpers/response";
import { LOGGED_OUT } from "~helpers/constants/i18n";

export default {
  Mutation: {
    // Log out is idempotent
    async logout(_, _args, { store, t, token, jwt, clientId }) {
      if (token) {
        const userInfo = jwt.decode(token);

        await store.remove(`${userInfo.sub}:${clientId}`);
      }

      return Ok({
        message: t(LOGGED_OUT),
      });
    },
  },
};
