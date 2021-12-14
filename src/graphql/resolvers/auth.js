import MutationError from "~utils/errors/MutationError";
import { WELCOME_NEW_USER } from "~helpers/constants";

export default {
  Mutation: {
    async registerWithEmail(_, { input }, { dataSources, jwt, redis, t }) {
      try {
        const { id, firstName } = await dataSources.users.createWithEmail(
          input
        );
        const accessToken = jwt.sign({ userId: id });
        const refreshToken = jwt.sign({ key: id }, "7d");
        await redis.set(id, refreshToken);

        return {
          success: true,
          message: t(WELCOME_NEW_USER, { firstName }),
          accessToken,
          refreshToken,
        };
      } catch (e) {
        if (e instanceof MutationError) {
          const { errors } = e.cause;
          return {
            success: false,
            message: e.message,
            errors,
          };
        } else {
          throw e;
        }
      }
    },
    refreshToken() {},
    resendConfirmationEmail() {},
    loginWithEmail() {},
    requestEmailOTP() {},
    requestSmsOTP() {},
    loginWithEmailOTP() {},
    loginWithSmsOTP() {},
    loginWithSocialProvider() {},
    requestPasswordReset() {},
    resetPassword() {},
    requestDeleteAccount() {},
    deleteAccount() {},
    logout() {},
  },
};
