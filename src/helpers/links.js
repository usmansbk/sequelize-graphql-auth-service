import btoa from "btoa";

const { CLIENT_HOST, CLOUDFRONT_API_ENDPOINT } = process.env;

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
  verifyEmail: (token) => `${CLIENT_HOST}/verify_email?token=${token}`,
  resetPassword: (token) => `${CLIENT_HOST}/reset_password?token=${token}`,
  deleteAccount: (token) => `${CLIENT_HOST}/delete_account?token=${token}`,
  getImageUrl,
};

export default links;
