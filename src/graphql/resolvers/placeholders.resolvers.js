export default {
  Mutation: {
    refreshToken() {},
    loginWithEmail() {},
    requestEmailOTP() {},
    requestSmsOTP() {},
    loginWithEmailOTP() {},
    loginWithSmsOTP() {},
    loginWithSocialProvider() {},
    resendConfirmationEmail() {},
    requestPasswordReset() {},
    resetPassword() {},
    requestDeleteAccount() {},
    deleteAccount() {},
    logout() {},
  },
  Query: {
    me() {
      return null;
    },
  },
};
