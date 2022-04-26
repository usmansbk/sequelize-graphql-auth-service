import analytics from "~services/analytics";
import QueryError from "~utils/errors/QueryError";
import { Fail, Success } from "~helpers/response";
import { USER_PREFIX } from "~constants/auth";

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
      { input: { id, status, reason } },
      { dataSources, t }
    ) {
      try {
        const user = await dataSources.users.update(id, { status });
        if (reason) {
          analytics.track({
            event: "Changed Status",
            properties: {
              reason,
            },
          });
        }
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
    async deleteUser(_parent, { id }, { dataSources, t, cache }) {
      try {
        await dataSources.users.destroy(id);
        await cache.remove(`${USER_PREFIX}:${id}`);
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
    async assignRolesToUser(
      _parent,
      { roleIds, userId },
      { dataSources, db, t, cache }
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
        await cache.remove(`${USER_PREFIX}:${userId}`);
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
    async removeRolesFromUser(
      _parent,
      { roleIds, userId },
      { dataSources, db, t, cache }
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
        await cache.remove(`${USER_PREFIX}:${userId}`);
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
