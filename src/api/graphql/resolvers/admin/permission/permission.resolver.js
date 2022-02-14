export default {
  Query: {
    async permissions(_parent, _args, { dataSources }) {
      const items = await dataSources.permissions.findAll();
      const totalCount = items.length;

      return {
        items,
        totalCount,
      };
    },
  },
};
