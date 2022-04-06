import QueryError from "~utils/errors/QueryError";
import { Fail, Success } from "~helpers/response";

export default {
  User: {
    picture(user) {
      return user.avatar;
    },
    isOwner(user, _args, { currentUser }) {
      return user.id === currentUser?.id;
    },
    /**
     * Fields aren't eager-loaded when we run mutations like `update`
     * In such case, we fallback to lazy-load the associations
    */
    roles(user) {
      return user.roles || user.getRoles();
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
    users(_parent, { page, filter }, { dataSources }, info) {
      return dataSources.users.paginate({ page, filter, info });
    },
  },
  Mutation: {
    async createUserAccounts(
      _parent,
      { input: { profiles, roleIds } },
      { dataSources, db, t }
    ) {
      try {
        const users = await db.sequelize.transaction(async (transaction) => {
          const newUsers = await dataSources.users.createMany(profiles, {
            transaction,
          });
          if (roleIds?.length) {
            const roles = await dataSources.roles.findAll({
              where: {
                id: roleIds,
              },
              transaction,
            });
            await Promise.all(
              roles.map((role) => role.addMembers(newUsers, { transaction }))
            );
          }
          return newUsers;
        });
        return Success({ users });
      } catch (e) {
        if (e instanceof QueryError) {
          return Fail({
            message: t(e.message),
            errors: e.errors,
            code: e.code,
          });
        }

        throw e;
      }
    },
    async updateUserProfile(
      _parent,
      { input: { id, ...values } },
      { dataSources, t }
    ) {
      try {
        const user = await dataSources.users.update(id, values);
        return Success({ user });
      } catch (e) {
        if (e instanceof QueryError) {
          return Fail({
            message: t(e.message),
            errors: e.errors,
            code: e.code,
          });
        }

        throw e;
      }
    },
    async deleteUserAccounts(_parent, { ids }, { dataSources, t }) {
      try {
        await dataSources.users.destroyMany(ids);
        return Success({ ids });
      } catch (e) {
        if (e instanceof QueryError) {
          return Fail({
            message: t(e.message),
            errors: e.errors,
            code: e.code,
          });
        }

        throw e;
      }
    },
  },
};
