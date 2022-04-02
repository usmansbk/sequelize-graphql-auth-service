export default {
  Query: {
    permissions(_parent, { page }, { dataSources }) {
      return dataSources.permissions.paginate({ page });
    },
  },
  Mutation: {
    createPermissions(_parent, { inputs }, { dataSources }) {
      return dataSources.permissions.createMany(inputs);
    },
    updatePermission(_parent, { input: { id, ...values } }, { dataSources }) {
      return dataSources.permissions.update(id, values);
    },
    deletePermissions(_parent, { ids }, { dataSources }) {
      return dataSources.permissions.destroyMany(ids);
    },
  },
};
