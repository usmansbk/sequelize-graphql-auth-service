export default {
  User: {
    async picture(parent, _args, { dataSources }) {
      const avatar = await dataSources.users.getAvatar(parent.id);
      console.log(avatar);
      return parent.socialAvatarURL;
    },
  },
};
