export default {
  Query: {
    async users(_parent, _args, { dataSources }) {
      const items = await dataSources.users.findAll();
      const totalCount = items.length;

      return {
        items,
        totalCount,
      };
    },
  },
};
