import QueryError from "~utils/errors/QueryError";
import { Fail, Success } from "~helpers/response";
import { ROLE_NOT_FOUND } from "~constants/i18n";
import { buildEagerLoadingQuery } from "~utils/transformers/eagerLoader";

export default {
  Role: {
    permissions(role) {
      return role.permissions || role.getPermissions();
    },
    members(role, { page, where }, { dataSources }, info) {
      return dataSources.users.paginate({
        page,
        info,
        filter: {
          where,
          include: {
            roles: {
              where: {
                id: {
                  eq: role.id,
                },
              },
            },
          },
        },
      });
    },
  },
  Query: {
    roles(_parent, { page, filter }, { dataSources }, info) {
      return dataSources.roles.paginate({ page, filter, info });
    },
    async getRoleById(_parent, { id }, { dataSources, t }, info) {
      try {
        const role = await dataSources.roles.findOne({
          where: { id },
          include: buildEagerLoadingQuery({
            info,
            model: dataSources.roles.model,
            path: "role",
          }),
        });

        if (!role) {
          throw new QueryError(ROLE_NOT_FOUND);
        }

        return Success({ role });
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
