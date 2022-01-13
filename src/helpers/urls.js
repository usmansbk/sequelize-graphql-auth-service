const { HOST } = process.env;

const UrlFactory = {
  verifyEmail: (token) => `${HOST}/verify_email?token=${token}`,
  resetPassword: (token) => `${HOST}/reset_password?token=${token}`,
  deleteAccount: (token) => `${HOST}/delete_account?token=${token}`,
};

export default UrlFactory;
