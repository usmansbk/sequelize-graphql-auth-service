import MutationError from "~utils/errors/MutationError";
import { WELCOME_NEW_USER } from "~helpers/constants/i18n";
import { Created, BadRequest } from "~helpers/response";

export default {
  Mutation: {
    async registerWithEmail(_, { input }, { dataSources, jwt, t, redis }) {
      try {
        const { id, firstName, language } =
          await dataSources.users.createWithEmail(input);

        const { accessToken, refreshToken, tokenId, exp } =
          jwt.generateAuthTokens({
            sub: id,
            language,
          });
        await redis.setex(tokenId, exp, refreshToken); // refresh token rotation

        return Created({
          message: t(WELCOME_NEW_USER, { firstName }),
          accessToken,
          refreshToken,
        });
      } catch (e) {
        if (e instanceof MutationError) {
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
