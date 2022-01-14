export default {
  User: {
    picture(parent) {
      return parent.socialAvatarURL;
    },
  },
};
