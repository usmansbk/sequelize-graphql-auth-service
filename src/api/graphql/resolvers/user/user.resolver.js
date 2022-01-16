import links from "~helpers/links";

export default {
  User: {
    async picture(parent, { resize }, { dataSources }) {
      const avatar = await dataSources.files.findByPk(parent.avatarId);

      let url;
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
        url = links.imageUrl(imageRequest);
      }

      if (parent.socialAvatarURL) {
        url = parent.socialAvatarURL;
      }

      return {
        url,
      };
    },
    isOwner(parent, _args, { tokenInfo }) {
      return parent.id === tokenInfo?.sub;
    },
  },
};
