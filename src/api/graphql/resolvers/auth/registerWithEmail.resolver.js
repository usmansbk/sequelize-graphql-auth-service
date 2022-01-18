import QueryError from "~utils/errors/QueryError";
import { SIGNUP_FAILED, WELCOME_NEW_USER } from "~helpers/constants/i18n";
import { Created, BadRequest } from "~helpers/response";

export default {
  Mutation: {
    async registerWithEmail(
      _parent,
      { input },
      { dataSources, jwt, t, store, clientId }
    ) {
      try {
        const { id, firstName, language } =
          await dataSources.users.createWithEmail(input);

        const { accessToken, refreshToken, refreshTokenId, exp } =
          jwt.generateAuthTokens({
            sub: id,
            aud: clientId,
            lng: language,
          });

        // refresh token rotation
        await store.set({
          key: `${clientId}:${id}`,
          value: refreshTokenId,
          expiresIn: exp,
        });

        return Created({
          message: t(WELCOME_NEW_USER, { firstName }),
          accessToken,
          refreshToken,
        });
      } catch (e) {
        if (e instanceof QueryError) {
          return BadRequest({
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
