export default {
  Query: {
    permissions(_parent, { page }, { dataSources }) {
      return dataSources.permissions.paginate({ page });
    },
  },
  Mutation: {
    deletePermissions: (_, { ids }, { dataSources }) => dataSources.permissions.destroyMany(ids),
  },
};
