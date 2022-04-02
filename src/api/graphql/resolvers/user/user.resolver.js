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
    createUserAccounts(
      _parent,
      { input: { profiles, roleIds } },
      { dataSources, db }
    ) {
      return db.sequelize.transaction(async (transaction) => {
        const users = await dataSources.users.createMany(profiles, {
          transaction,
        });
        const roles = await dataSources.roles.findAll({
          where: {
            id: roleIds,
          },
          transaction,
        });
        await Promise.all(
          roles.map((role) => role.addMembers(users, { transaction }))
        );
        return users;
      });
    },
    updateUserProfile(_parent, { input: { id, ...values } }, { dataSources }) {
      return dataSources.users.update(id, values);
    },
    deleteUserAccounts(_parent, { ids }, { dataSources }) {
      return dataSources.users.destroyMany(ids);
    },
  },
};
