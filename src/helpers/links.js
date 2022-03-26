import btoa from "btoa";
import { MIN_THUMBNAIL_SIZE } from "~constants/files";

const { HOST, CLOUDFRONT_API_ENDPOINT } = process.env;

const links = {
  verifyEmail: (token) => `${HOST}/verify_email?token=${token}`,
  resetPassword: (token) => `${HOST}/reset_password?token=${token}`,
  deleteAccount: (token) => `${HOST}/delete_account?token=${token}`,
  imageUrl: (imageRequest) =>
    `${CLOUDFRONT_API_ENDPOINT}${btoa(JSON.stringify(imageRequest))}`,
};

export const getPhotoLinks = (file, resize) => {
  const imageRequest = {
    ...file,
    edits: {
      resize,
    },
  };

  const size = resize
    ? Math.max(MIN_THUMBNAIL_SIZE, resize.thumbnailSize)
    : MIN_THUMBNAIL_SIZE;
  const thumbnailRequest = {
    ...imageRequest,
    edits: {
      resize: {
        width: size,
        height: size,
      },
    },
  };

  return {
    url: links.imageUrl(imageRequest),
    thumbnail: links.imageUrl(thumbnailRequest),
  };
};

export default links;
