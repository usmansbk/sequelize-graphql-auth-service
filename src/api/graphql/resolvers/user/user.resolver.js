import { Fail, Success } from "~helpers/response";
import QueryError from "~utils/errors/QueryError";

export default {
  User: {
    picture(parent) {
      return parent.avatar;
    },
    isOwner(parent, _args, { currentUser }) {
      return parent.id === currentUser?.id;
    },
    roles(parent) {
      return parent.getRoles();
    },
  },
  Query: {
    async me(_parent, _args, { t, currentUser }) {
      try {
        return Success({ user: currentUser });
      } catch (e) {
        if (e instanceof QueryError) {
          return Fail({
            message: t(e.message),
            code: e.code,
          });
        }
        throw e;
      }
    },
    users(_parent, { page }, { dataSources }) {
      return dataSources.users.paginate({ page });
    },
  },
  Mutation: {
    async createUserProfiles(
      _parent,
      { input: { profiles } },
      { dataSources }
    ) {
      const users = await dataSources.users.createMany(profiles);
      // const roles = await dataSources.roles.findAll({
      //   where: {
      //     id: roleIds,
      //   },
      // });

      return users;
    },
    updateUserProfile(_parent, { input: { id, ...values } }, { dataSources }) {
      return dataSources.users.update(id, values);
    },
    deleteUserAccounts(_parent, { ids }, { dataSources }) {
      return dataSources.users.destroyMany(ids);
    },
  },
};
