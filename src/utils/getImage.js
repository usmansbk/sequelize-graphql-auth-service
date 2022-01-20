import links from "~helpers/links";
import { MIN_AVATAR_THUMBNAIL_SIZE } from "~helpers/constants/files";

const getImage = (file, resize) => {
  const imageRequest = {
    ...file.toJSON(),
    edits: {
      resize,
    },
  };

  const size = resize
    ? Math.max(MIN_AVATAR_THUMBNAIL_SIZE, resize.thumbnailSize)
    : MIN_AVATAR_THUMBNAIL_SIZE;
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

export default getImage;
