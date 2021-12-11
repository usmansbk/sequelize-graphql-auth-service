export default {
  Mutation: {
    loginWithEmail() {
      return {
        success: true,
        message: "Mock",
      };
    },
    requestEmailOTP() {},
    requestSmsOTP() {},
    loginWithEmailOTP() {},
    loginWithSmsOTP() {},
    loginWithSocialProvider() {},
    registerWithEmail() {},
    resendConfirmationEmail() {},
    confirmEmail() {},
    requestPasswordReset() {},
    resetPassword() {},
    requestDeleteAccount() {},
    deleteAccount() {},
    logout() {},
  },
};
