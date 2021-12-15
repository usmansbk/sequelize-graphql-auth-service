import MutationError from "~utils/errors/MutationError";
import { WELCOME_NEW_USER } from "~helpers/constants";

export default {
  Mutation: {
    async registerWithEmail(_, { input }, { dataSources, jwt, session, t }) {
      try {
        const { id, firstName } = await dataSources.users.createWithEmail(
          input
        );
        const accessToken = jwt.sign({ userId: id });
        const refreshToken = jwt.sign({}, "7d");
        await session.set(id, refreshToken);

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
    resendConfirmationEmail() {},
  },
};
