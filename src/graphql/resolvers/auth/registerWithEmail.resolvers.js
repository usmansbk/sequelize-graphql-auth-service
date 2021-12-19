import MutationError from "~utils/errors/MutationError";
import { WELCOME_NEW_USER } from "~helpers/constants";

export default {
  Mutation: {
    async registerWithEmail(_, { input }, { dataSources, jwt, t, redis }) {
      try {
        const { id, firstName, language } =
          await dataSources.users.createWithEmail(input);

        const { accessToken, refreshToken, tokenId, ex } = jwt.getAuthTokens({
          id,
          language,
        });
        await redis.setex(tokenId, ex, refreshToken); // refresh token rotation

        return {
          success: true,
          message: t(WELCOME_NEW_USER, { firstName }),
          accessToken,
          refreshToken,
        };
      } catch (e) {
        if (e instanceof MutationError) {
          return {
            success: false,
            message: t(e.message),
            errors: e.cause.errors,
          };
        } else {
          throw e;
        }
      }
    },
  },
};
