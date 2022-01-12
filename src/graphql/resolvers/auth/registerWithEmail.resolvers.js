import QueryError from "~utils/errors/QueryError";
import { WELCOME_NEW_USER } from "~helpers/constants/i18n";
import { Created, BadRequest } from "~helpers/response";

export default {
  Mutation: {
    async registerWithEmail(
      _,
      { input },
      { dataSources, jwt, t, redis, clientId }
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
          },
          "2 weeks"
        );

        const { accessToken, refreshToken, refreshTokenId, exp } =
          jwt.generateAuthTokens({
            sub: id,
            aud: clientId,
            firstName,
            lastName,
            language,
            fullName,
          });
        await redis.setex(`${id}:${clientId}`, exp, refreshTokenId); // refresh token rotation

        return Created({
          message: t(WELCOME_NEW_USER, { firstName }),
          idToken,
          accessToken,
          refreshToken,
        });
      } catch (e) {
        if (e instanceof QueryError) {
          return BadRequest({
            message: t(e.message),
            errors: e.cause.errors,
          });
        }
        throw e;
      }
    },
  },
};
