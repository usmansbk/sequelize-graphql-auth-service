export default {
  Query: {
    permissions(_parent, { page }, { dataSources }, info) {
      return dataSources.permissions.paginate({ page }, info);
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
