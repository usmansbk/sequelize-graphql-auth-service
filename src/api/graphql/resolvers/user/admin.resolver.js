import QueryError from "~utils/errors/QueryError";
import { Fail, Success } from "~helpers/response";

export default {
  Query: {
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
    async attachRolesToUser(
      _parent,
      { roleIds, userId },
      { dataSources, db, t }
    ) {
      try {
        const user = await db.sequelize.transaction(async (transaction) => {
          const account = await dataSources.users.findOne({
            where: {
              id: userId,
            },
            transaction,
          });
          await account.addRoles(roleIds, { transaction });
          return account;
        });
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
    async detachRolesFromUser(
      _parent,
      { roleIds, userId },
      { dataSources, db, t }
    ) {
      try {
        const user = await db.sequelize.transaction(async (transaction) => {
          const account = await dataSources.users.findOne({
            where: {
              id: userId,
            },
            transaction,
          });
          await account.removeRoles(roleIds, { transaction });
          return account;
        });
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
  },
};
