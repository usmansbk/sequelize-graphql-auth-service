export default {
  Query: {
    roles(_parent, { page }, { dataSources }) {
      return dataSources.roles.paginate({ page });
    },
  },
  Mutation: {
    deleteRoles: (_, { ids }, { dataSources }) => dataSources.roles.destroyMany(ids),
  },
};
