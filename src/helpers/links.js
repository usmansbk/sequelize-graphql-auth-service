import btoa from "btoa";

const { HOST, CLOUDFRONT_API_ENDPOINT } = process.env;

const links = {
  verifyEmail: (token) => `${HOST}/verify_email?token=${token}`,
  resetPassword: (token) => `${HOST}/reset_password?token=${token}`,
  deleteAccount: (token) => `${HOST}/delete_account?token=${token}`,
  imageUrl: (imageRequest) => `${CLOUDFRONT_API_ENDPOINT}${btoa(imageRequest)}`,
};

export default links;
