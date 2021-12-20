import { EMAIL_VERIFIED, LINK_INVALID } from "~helpers/constants";
import MutationError from "~utils/errors/MutationError";

export default {
  Mutation: {
    async verifyEmail(_, { token }, { dataSources, jwt, t }) {
      try {
        const { id } = await jwt.verify(token);
        await dataSources.users.verifyEmail(id);

        return {
          success: true,
          message: t(EMAIL_VERIFIED),
        };
      } catch (e) {
        if (e instanceof MutationError) {
          return {
            success: false,
            message: t(LINK_INVALID),
          };
        } else {
          throw e;
        }
      }
    },
  },
};
