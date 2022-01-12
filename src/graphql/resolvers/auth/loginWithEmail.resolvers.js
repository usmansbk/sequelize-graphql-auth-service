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
        const { id, firstName, lastName, fullName, language } =
          await dataSources.users.findByEmailAndPassword(input);

        const { token: idToken } = jwt.generateToken(
          {
            firstName,
            lastName,
            fullName,
            language,
          },
          "10 hours"
        );

        const { accessToken, refreshToken, refreshTokenId, exp } =
          await jwt.generateAuthTokens({
            sub: id,
            aud: clientId,
            language,
          });

        await redis.setex(`${id}:${clientId}`, exp, refreshTokenId); // refresh token rotation

        return Ok({
          message: t(WELCOME_EXISTING_USER, { firstName }),
          idToken,
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
