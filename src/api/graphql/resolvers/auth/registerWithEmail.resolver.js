import QueryError from "~utils/errors/QueryError";
import { SIGNUP_FAILED, WELCOME_NEW_USER } from "~constants/i18n";
import { Success, Fail } from "~helpers/response";

export default {
  Mutation: {
    async registerWithEmail(
      _parent,
      { input },
      { dataSources, jwt, t, store, clientId }
    ) {
      try {
        const { id, firstName } = await dataSources.users.createWithEmail(
          input
        );

        const { accessToken, refreshToken, sid, exp } = jwt.generateAuthTokens({
          sub: id,
          aud: clientId,
        });

        // refresh token rotation
        await store.set({
          key: `${clientId}:${id}`,
          value: sid,
          expiresIn: exp,
        });

        return Success({
          message: t(WELCOME_NEW_USER, { firstName }),
          code: WELCOME_NEW_USER,
          accessToken,
          refreshToken,
        });
      } catch (e) {
        if (e instanceof QueryError) {
          return Fail({
            message: t(SIGNUP_FAILED),
            code: e.code,
            errors: e.errors,
          });
        }
        throw e;
      }
    },
  },
};
