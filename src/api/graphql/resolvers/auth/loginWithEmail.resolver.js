import QueryError from "~utils/errors/QueryError";
import { Fail, Success } from "~helpers/response";
import {
  INCORRECT_EMAIL_OR_PASSWORD,
  WELCOME_BACK,
} from "~helpers/constants/i18n";

export default {
  Mutation: {
    async loginWithEmail(
      _parent,
      { input },
      { dataSources, jwt, t, store, clientId }
    ) {
      try {
        const user = await dataSources.users.findByEmailAndPassword(input);

        if (!user) {
          throw new QueryError(INCORRECT_EMAIL_OR_PASSWORD);
        }

        const { id, firstName, language } = user;

        const { accessToken, refreshToken, sid, exp } = jwt.generateAuthTokens({
          sub: id,
          aud: clientId,
          lng: language,
        });

        // refresh token rotation
        await store.set({
          key: `${clientId}:${id}`,
          value: sid,
          expiresIn: exp,
        });

        return Success({
          message: t(WELCOME_BACK, { firstName }),
          code: WELCOME_BACK,
          accessToken,
          refreshToken,
        });
      } catch (e) {
        if (e instanceof QueryError) {
          return Fail({
            message: t(e.message),
            code: e.code,
          });
        }
        throw e;
      }
    },
  },
};
