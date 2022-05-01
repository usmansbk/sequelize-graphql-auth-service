export default {
  Query: {
    totalUserCount(_parent, _arg, { dataSources }) {
      return dataSources.users.count();
    },
    newUserCount(_parent, arg, { dataSources }) {
      const { since } = arg || {};
      return dataSources.users.count({
        where: {
          createdAt: {
            gt: since,
          },
        },
      });
    },
  },
};
