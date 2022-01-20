import links from "~helpers/links";
import { MIN_AVATAR_THUMBNAIL_SIZE } from "~helpers/constants/files";

export default {
  User: {
    async picture(parent, { resize }, { dataSources }) {
      const file = await dataSources.files.findByPk(parent.avatarId);

      if (file) {
        const imageRequest = {
          ...file,
          edits: {
            resize,
          },
        };

        const size = resize
          ? Math.max(MIN_AVATAR_THUMBNAIL_SIZE, resize.thumbnailSize)
          : MIN_AVATAR_THUMBNAIL_SIZE;
        const thumbnailRequest = {
          ...file,
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
      }

      if (parent.socialAvatarURL) {
        return {
          url: parent.socialAvatarURL,
          thumbnail: parent.socialAvatarURL,
        };
      }

      return null;
    },
    isOwner(parent, _args, { tokenInfo }) {
      return parent.id === tokenInfo?.sub;
    },
  },
};
