export default {
  Query: {
    roles(_parent, { page }, { dataSources }) {
      return dataSources.roles.paginate(page);
    },
  },
};
