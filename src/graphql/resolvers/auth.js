export default {
  Mutation: {
    async registerWithEmail(_, { input }, { dataSources, jwt, redis }) {
      try {
        const { id, firstName } = await dataSources.users.createWithEmail(
          input
        );
        const accessToken = jwt.sign({ userId: id });
        const refreshToken = jwt.sign({ key: id }, "7d");
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
