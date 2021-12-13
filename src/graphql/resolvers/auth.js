export default {
  Mutation: {
    async registerWithEmail(_, { input }, { dataSources, JWT }) {
      try {
        const user = await dataSources.users.createWithEmail(input);
        const accessToken = JWT.sign({ id: user.id });
        const refreshToken = JWT.sign({}, "7d");

        return {
          success: true,
          message: `Welcome, ${user.firstName}!`,
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
