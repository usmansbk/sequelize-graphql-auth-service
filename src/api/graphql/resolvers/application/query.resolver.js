export default {
  Query: {
    applications(_parent, _args, { dataSources }) {
      return dataSources.applications.findAll({
        order: [["name", "ASC"]],
      });
    },
    getApplicationById(_parent, { id }, { dataSources }) {
      return dataSources.applications.findByPk(id);
    },
  },
};
