const { HOST } = process.env;

const UrlFactory = {
  verifyEmail: (token) => `${HOST}/verify_email?token=${token}`,
};

export default UrlFactory;
