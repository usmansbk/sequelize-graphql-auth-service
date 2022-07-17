import btoa from "btoa";

const { DEFAULT_CLIENT_HOST, CLOUDFRONT_API_ENDPOINT } = process.env;

export const getImageUrl = (file, resize) => {
  const imageRequest = {
    ...file,
    edits: {
      resize,
    },
  };

  return `${CLOUDFRONT_API_ENDPOINT}/${btoa(JSON.stringify(imageRequest))}`;
};

const links = {
  verifyEmail: (token) => `${DEFAULT_CLIENT_HOST}/verify_email?token=${token}`,
  resetPassword: (token) =>
    `${DEFAULT_CLIENT_HOST}/reset_password?token=${token}`,
  deleteAccount: (token) =>
    `${DEFAULT_CLIENT_HOST}/delete_account?token=${token}`,
  getImageUrl,
};

export default links;
