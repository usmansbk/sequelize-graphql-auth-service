import QueryError from "~utils/errors/QueryError";

export default {
  Query: {
    async me(_parent, _args, { dataSources, t }) {
      try {
        const user = await dataSources.users.currentUser();
        return {
          success: true,
          user,
        };
      } catch (e) {
        if (e instanceof QueryError) {
          return {
            success: false,
            message: t(e.message),
          };
        } else {
          throw e;
        }
      }
    },
  },
};
