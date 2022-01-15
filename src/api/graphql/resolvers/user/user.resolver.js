import links from "~helpers/links";

export default {
  User: {
    async picture(parent, { resize }, { dataSources }) {
      const avatar = await dataSources.files.findByPk(parent.avatarId);

      if (avatar) {
        let imageRequest = avatar.toJSON();

        if (resize) {
          imageRequest = {
            ...imageRequest,
            edits: {
              resize,
            },
          };
        }
        return links.imageUrl(imageRequest);
      }

      if (parent.socialAvatarURL) {
        return parent.socialAvatarURL;
      }

      return null; // or default image placeholder
    },
  },
};
