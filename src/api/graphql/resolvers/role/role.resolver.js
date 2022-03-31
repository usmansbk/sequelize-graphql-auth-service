export default {
  Query: {
    roles(_parent, { page }, { dataSources }) {
      return dataSources.roles.paginate({ page });
    },
  },
  Mutation: {
    deleteRoles(_parent, { ids }, { dataSources }) {
      return dataSources.roles.destroyMany(ids);
    },
  },
};
