export default {
  Query: {
    roles(_parent, { page }, { dataSources }) {
      return dataSources.roles.paginate({ page });
    },
  },
  Mutation: {
    updateRole(_parent, { input: { id, ...values } }, { dataSources }) {
      return dataSources.roles.update(id, values);
    },
    deleteRoles(_parent, { ids }, { dataSources }) {
      return dataSources.roles.destroyMany(ids);
    },
  },
};
