import btoa from "btoa";

const { HOST, CLOUDFRONT_API_ENDPOINT } = process.env;

export const getImageUrl = (file, resize) => {
  const imageRequest = {
    ...file,
    edits: {
      resize,
    },
  };

  return `${CLOUDFRONT_API_ENDPOINT}${btoa(JSON.stringify(imageRequest))}`;
};

const links = {
  verifyEmail: (token) => `${HOST}/verify_email?token=${token}`,
  resetPassword: (token) => `${HOST}/reset_password?token=${token}`,
  deleteAccount: (token) => `${HOST}/delete_account?token=${token}`,
  getImageUrl,
};

export default links;
