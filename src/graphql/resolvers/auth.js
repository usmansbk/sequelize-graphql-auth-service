export default {
  Mutation: {
    async registerWithEmail(_, { input }, { dataSources, JWT }) {
      try {
        const user = await dataSources.users.createWithEmail(input);
        const token = JWT.sign({ id: user.id });

        return {
          success: true,
          message: `Welcome, ${user.firstName}!`,
          token,
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
