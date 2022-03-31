export default {
  Query: {
    permissions: (_parent, { page }, { dataSources }) =>
      dataSources.permissions.paginate({ page }),
  },
  Mutation: {
    deletePermissions: (_, { ids }, { dataSources }) =>
      dataSources.permissions.destroyMany(ids),
  },
};
