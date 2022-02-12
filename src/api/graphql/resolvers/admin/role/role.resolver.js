export default {
  Query: {
    async roles(_parent, _args, { dataSources }) {
      const items = await dataSources.roles.findAll();

      return {
        items,
      };
    },
  },
};
