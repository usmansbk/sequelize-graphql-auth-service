import QueryError from "~utils/errors/QueryError";
import { Fail, Success } from "~helpers/response";
import { ROLE_MEMBERS_ALIAS } from "~constants/models";
import { AUTH_KEY_PREFIX } from "~constants/auth";

export default {
  Query: {
    roles(_parent, { page, filter }, { dataSources }, info) {
      return dataSources.roles.paginate({
        page,
        filter,
        info,
        skip: ["members"],
      });
    },
  },
  Mutation: {
    async createRole(
      _parent,
      { input: { permissionIds, ...values } },
      { dataSources, db, t }
    ) {
      try {
        const role = await db.sequelize.transaction(async (transaction) => {
          const newRole = await dataSources.roles.create(values, {
            transaction,
          });

          if (permissionIds?.length) {
            await newRole.addPermissions(permissionIds, { transaction });
          }
          return newRole;
        });
        return Success({ role });
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
    async updateRole(
      _parent,
      { input: { id, ...values } },
      { dataSources, t }
    ) {
      try {
        const role = await dataSources.roles.update(id, values);
        return Success({ role });
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
    async deleteRole(_parent, { id }, { dataSources, t }) {
      try {
        await dataSources.roles.destroy(id);
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
    async attachPermissionsToRole(
      _parent,
      { roleId, permissionIds },
      { dataSources, db, t, cache }
    ) {
      try {
        const role = await db.sequelize.transaction(async (transaction) => {
          const foundRole = await dataSources.roles.findOne({
            where: {
              id: roleId,
            },
            include: [
              {
                association: ROLE_MEMBERS_ALIAS,
              },
            ],
            transaction,
          });
          await foundRole.addPermissions(permissionIds, { transaction });
          return foundRole;
        });
        if (role.members.length) {
          await cache.remove(
            ...role.members.map(({ id }) => `${AUTH_KEY_PREFIX}:${id}`)
          );
        }
        return Success({ role });
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
    async detachPermissionsFromRole(
      _parent,
      { roleId, permissionIds },
      { dataSources, db, t, cache }
    ) {
      try {
        const role = await db.sequelize.transaction(async (transaction) => {
          const foundRole = await dataSources.roles.findOne({
            where: {
              id: roleId,
            },
            include: [
              {
                association: ROLE_MEMBERS_ALIAS,
              },
            ],
            transaction,
          });
          await foundRole.removePermissions(permissionIds, { transaction });
          return foundRole;
        });
        if (role.members.length) {
          await cache.remove(
            ...role.members.map(({ id }) => `${AUTH_KEY_PREFIX}:${id}`)
          );
        }
        return Success({ role });
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
    async detachRoleFromAllMembers(
      _parent,
      { roleId },
      { dataSources, db, t, cache }
    ) {
      try {
        const role = await db.sequelize.transaction(async (transaction) => {
          const foundRole = await dataSources.roles.findOne({
            where: {
              id: roleId,
            },
            include: [
              {
                association: ROLE_MEMBERS_ALIAS,
              },
            ],
            transaction,
          });
          const members = await foundRole.getMembers({ transaction });
          await foundRole.removeMembers(members, { transaction });
          return foundRole;
        });
        if (role.members.length) {
          await cache.remove(
            ...role.members.map(({ id }) => `${AUTH_KEY_PREFIX}:${id}`)
          );
        }
        return Success({ role });
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
