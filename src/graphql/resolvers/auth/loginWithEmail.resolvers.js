import QueryError from "~utils/errors/QueryError";
import { WELCOME_EXISTING_USER } from "~helpers/constants/i18n";
import { BadRequest, Ok } from "~helpers/response";

export default {
  Mutation: {
    async loginWithEmail(
      _,
      { input },
      { dataSources, jwt, t, redis, clientId }
    ) {
      try {
        const { id, firstName, language } =
          await dataSources.users.findByEmailAndPassword(input);

        const { accessToken, refreshToken, refreshTokenId, exp } =
          await jwt.generateAuthTokens({
            sub: id,
            aud: clientId,
            language,
          });
        await redis.setex(`${id}:${clientId}`, exp, refreshTokenId); // refresh token rotation

        return Ok({
          message: t(WELCOME_EXISTING_USER, { firstName }),
          accessToken,
          refreshToken,
        });
      } catch (e) {
        if (e instanceof QueryError) {
          return BadRequest({
            message: t(e.message),
          });
        }
        throw e;
      }
    },
  },
};
