import QueryError from "~utils/errors/QueryError";
import { Success, Fail } from "~helpers/response";
import analytics from "~services/analytics";
import { SIGNUP_FAILED, WELCOME_NEW_USER } from "~constants/i18n";

export default {
  Mutation: {
    async registerWithEmail(
      _parent,
      { input },
      { dataSources, jwt, t, cache, clientId }
    ) {
      try {
        const { id, firstName, email, fullName, locale, username } =
          await dataSources.users.createWithEmail(input);

        const { accessToken, refreshToken, sid, exp } = jwt.generateAuthTokens({
          sub: id,
          aud: clientId,
        });

        // refresh token rotation
        await cache.set({
          key: `${clientId}:${id}`,
          value: sid,
          expiresIn: exp,
        });

        analytics.track({
          userId: id,
          event: "Signed Up",
          properties: {
            fullName,
            email,
            username,
            clientId,
            locale,
          },
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
