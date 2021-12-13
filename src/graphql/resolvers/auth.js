export default {
  Mutation: {
    async registerWithEmail(_, { input }, { dataSources, JWT, redis }) {
      try {
        const { id, firstName } = await dataSources.users.createWithEmail(
          input
        );
        const accessToken = JWT.sign({ id });
        const refreshToken = JWT.sign(id, "7d");
        await redis.set(id, refreshToken);

        return {
          success: true,
          message: `Welcome, ${firstName}!`,
          accessToken,
          refreshToken,
        };
      } catch ({ errors, message }) {
        return {
          success: false,
          message,
          errors,
        };
      }
    },
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
