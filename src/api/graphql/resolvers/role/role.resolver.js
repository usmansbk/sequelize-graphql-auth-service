export default {
  Query: {
    roles(_parent, { page }, { dataSources }) {
      return dataSources.roles.paginate({ page });
    },
  },
  Mutation: {
    updateRoles(_parent, { inputs }, { dataSources }) {
      return dataSources.roles.updateMany(inputs);
    },
    deleteRoles(_parent, { ids }, { dataSources }) {
      return dataSources.roles.destroyMany(ids);
    },
  },
};
