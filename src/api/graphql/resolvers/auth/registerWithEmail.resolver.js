import QueryError from "~utils/errors/QueryError";
import { SIGNUP_FAILED, WELCOME_NEW_USER } from "~helpers/constants/i18n";
import { Created, BadRequest } from "~helpers/response";
import { ID_TOKEN_EXPIRES_IN } from "~helpers/constants/tokens";

export default {
  Mutation: {
    async registerWithEmail(
      _,
      { input },
      { dataSources, jwt, t, store, clientId }
    ) {
      try {
        const { id, firstName, lastName, fullName, language } =
          await dataSources.users.createWithEmail(input);

        const { token: idToken } = jwt.generateToken(
          {
            firstName,
            lastName,
            fullName,
            language,
            aud: clientId,
          },
          ID_TOKEN_EXPIRES_IN
        );

        const { accessToken, refreshToken, refreshTokenId, exp } =
          jwt.generateAuthTokens({
            sub: id,
            aud: clientId,
            language,
          });

        // refresh token rotation
        await store.set({
          key: `${id}:${clientId}`,
          value: refreshTokenId,
          expiresIn: exp,
        });

        return Created({
          message: t(WELCOME_NEW_USER, { firstName }),
          idToken,
          accessToken,
          refreshToken,
        });
      } catch (e) {
        if (e instanceof QueryError) {
          return BadRequest({
            message: t(SIGNUP_FAILED),
            errors: e.cause?.errors,
          });
        }
        throw e;
      }
    },
  },
};
