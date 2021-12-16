import MutationError from "~utils/errors/MutationError";
import { WELCOME_EXISTING_USER } from "~helpers/constants";

export default {
  Mutation: {
    async loginWithEmail(_, { input }, { dataSources, jwt, t }) {
      try {
        const { id, firstName, language } =
          await dataSources.users.findByEmailAndPassword(input);

        const { accessToken, refreshToken } = await jwt.getAuthTokens({
          id,
          language,
        });

        return {
          success: true,
          message: t(WELCOME_EXISTING_USER, { firstName }),
          accessToken,
          refreshToken,
        };
      } catch (e) {
        if (e instanceof MutationError) {
          return {
            success: false,
            message: t(e.message),
          };
        } else {
          throw e;
        }
      }
    },
  },
};
