export default {
  Query: {
    async permissions(_parent, _args, { dataSources }) {
      const items = await dataSources.permissions.findAll();

      return {
        items,
      };
    },
  },
};
