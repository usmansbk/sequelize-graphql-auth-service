export default {
  Query: {
    async users(_parent, _args, { dataSources }) {
      const items = await dataSources.users.findAll();

      return {
        items,
      };
    },
  },
};
