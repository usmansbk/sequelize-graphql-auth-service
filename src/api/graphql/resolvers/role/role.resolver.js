export default {
  Query: {
    async roles(_parent, _args, { dataSources }) {
      const items = await dataSources.roles.findAll();
      const totalCount = items.length;

      return {
        items,
        totalCount,
      };
    },
  },
};
