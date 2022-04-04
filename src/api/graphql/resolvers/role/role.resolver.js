import deepmerge from "deepmerge";
import QueryError from "~utils/errors/QueryError";
import { Fail, Success } from "~helpers/response";

export default {
  Role: {
    permissions(role) {
      return role.permissions || role.getPermissions();
    },
    members(role, { page, filter }, { dataSources }, info) {
      return dataSources.users.paginate({
        page,
        info,
        filter: deepmerge(filter, {
          include: {
            roles: {
              where: {
                id: {
                  eq: role.id,
                },
              },
            },
          },
        }),
      });
    },
  },
  Query: {
    roles(_parent, { page, filter }, { dataSources }, info) {
      return dataSources.roles.paginate({ page, filter, info });
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
            const permissions = await dataSources.permissions.findAll({
              where: { id: permissionIds },
              transaction,
            });
            await newRole.addPermissions(permissions, { transaction });
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
    async deleteRoles(_parent, { ids }, { dataSources, t }) {
      try {
        await dataSources.roles.destroyMany(ids);
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
