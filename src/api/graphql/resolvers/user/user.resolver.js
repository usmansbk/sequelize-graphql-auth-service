import { getPhotoLinks } from "~helpers/links";

export default {
  User: {
    async picture(parent, { resize }) {
      if (parent.avatar) {
        return getPhotoLinks(parent.avatar, resize);
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
