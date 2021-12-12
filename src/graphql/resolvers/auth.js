export default {
  Mutation: {
    async registerWithEmail(_, { input }, { dataSources }) {
      try {
        const user = await dataSources.users.createWithEmail(input);
        // generate token
        return {
          success: true,
          message: `Welcome, ${user.firstName}!`,
          token: "mockToken",
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
