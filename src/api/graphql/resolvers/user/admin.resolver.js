import QueryError from "~utils/errors/QueryError";
import { Fail, Success } from "~helpers/response";

export default {
  Query: {
    users(_parent, { page, filter }, { dataSources }, info) {
      return dataSources.users.paginate({ page, filter, info });
    },
  },
  Mutation: {
    async createUser(_parent, { input }, { dataSources, t }) {
      try {
        const user = await dataSources.users.create(input);
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
    async changeUserFullname(
      _parent,
      { input: { id, firstName, lastName } },
      { dataSources, t }
    ) {
      try {
        const user = await dataSources.users.update(id, {
          firstName,
          lastName,
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
    async changeUserUsername(
      _parent,
      { input: { id, username } },
      { dataSources, t }
    ) {
      try {
        const user = await dataSources.users.update(id, { username });
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
    async changeUserLocale(
      _parent,
      { input: { id, locale } },
      { dataSources, t }
    ) {
      try {
        const user = await dataSources.users.update(id, { locale });
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
    async changeUserEmail(
      _parent,
      { input: { id, email } },
      { dataSources, t }
    ) {
      try {
        const user = await dataSources.users.update(id, { email });
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
    async changeUserPhoneNumber(
      _parent,
      { input: { id, phoneNumber } },
      { dataSources, t }
    ) {
      try {
        const user = await dataSources.users.update(id, { phoneNumber });
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
    async changeUserPassword(
      _parent,
      { input: { id, password } },
      { dataSources, t }
    ) {
      try {
        const user = await dataSources.users.update(id, { password });
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
    async changeUserStatus(
      _parent,
      { input: { id, status } },
      { dataSources, t }
    ) {
      try {
        const user = await dataSources.users.update(id, { status });
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
    async removeUserAvatar(_parent, { id }, { t, dataSources }) {
      try {
        const user = await dataSources.users.findByPk(id);
        const avatar = await user.getAvatar();
        if (avatar) {
          await dataSources.files.destroy(avatar.id);
        }

        return Success({ user });
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
    async deleteUser(_parent, { id }, { dataSources, t }) {
      try {
        await dataSources.users.destroy(id);
        return Success({ id });
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
    async detachAllRolesFromUser(_parent, { userId }, { dataSources, db, t }) {
      try {
        const user = await db.sequelize.transaction(async (transaction) => {
          const account = await dataSources.users.findOne({
            where: {
              id: userId,
            },
            transaction,
          });
          const roles = await account.getRoles({ transaction });
          await account.removeRoles(roles, { transaction });
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
