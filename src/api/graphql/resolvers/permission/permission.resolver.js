export default {
  Query: {
    permissions(_parent, { page }, { dataSources }) {
      return dataSources.permissions.paginate({ page });
    },
  },
  Mutation: {
    deletePermissions(_parent, { ids }, { dataSources }) {
      return dataSources.permissions.destroyMany(ids);
    },
  },
};
