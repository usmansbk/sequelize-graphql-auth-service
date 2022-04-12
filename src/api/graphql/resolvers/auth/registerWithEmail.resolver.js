import QueryError from "~utils/errors/QueryError";
import { Success, Fail } from "~helpers/response";
import analytics from "~services/analytics";
import { SIGNUP_FAILED, WELCOME_NEW_USER } from "~constants/i18n";

export default {
  Mutation: {
    async registerWithEmail(
      _parent,
      { input },
      { dataSources, jwt, t, clientId }
    ) {
      try {
        const { id, firstName } = await dataSources.users.createWithEmail(
          input
        );

        const { accessToken, refreshToken } = await jwt.generateAuthTokens({
          sub: id,
          aud: clientId,
        });

        analytics.track({
          userId: id,
          event: "Signed Up",
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
