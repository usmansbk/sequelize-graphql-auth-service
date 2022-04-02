export default {
  Query: {
    permissions(_parent, { page }, { dataSources }) {
      return dataSources.permissions.paginate({ page });
    },
  },
  Mutation: {
    updatePermissions(_parent, { inputs }, { dataSources }) {
      return dataSources.permissions.updateMany(inputs);
    },
    deletePermissions(_parent, { ids }, { dataSources }) {
      return dataSources.permissions.destroyMany(ids);
    },
  },
};
