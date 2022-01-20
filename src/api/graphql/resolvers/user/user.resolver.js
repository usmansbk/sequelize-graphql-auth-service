import getImage from "~utils/getImage";

export default {
  User: {
    async picture(parent, { resize }, { dataSources }) {
      const file = await dataSources.files.findByPk(parent.avatarId);

      if (file) {
        return getImage(file, resize);
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
    roles() {
      return [{ name: "ADMIN" }]; // PLACEHOLDER
    },
  },
};
