import QueryError from "~utils/errors/QueryError";
import { Fail, Success } from "~helpers/response";
import { ROLES_ALIAS, ROLE_MEMBERS_ALIAS } from "~constants/models";
import { AUTH_KEY_PREFIX } from "~constants/auth";

export default {
  Query: {
    permissions(_parent, { page, filter }, { dataSources }, info) {
      return dataSources.permissions.paginate({
        page,
        filter,
        info,
        skip: ["roles"],
      });
    },
  },
  Mutation: {
    async createPermission(_parent, { input }, { dataSources, t }) {
      try {
        const permission = await dataSources.permissions.create(input);
        return Success({ permission });
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
    async updatePermission(
      _parent,
      { input: { id, ...values } },
      { dataSources, t }
    ) {
      try {
        const permission = await dataSources.permissions.update(id, values);
        return Success({ permission });
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
    async deletePermission(_parent, { id }, { dataSources, t }) {
      try {
        await dataSources.permissions.destroy(id);
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
    async detachPermissionFromAllRoles(
      _parent,
      { permissionId },
      { dataSources, db, t, cache }
    ) {
      try {
        const permission = await db.sequelize.transaction(
          async (transaction) => {
            const foundPermission = await dataSources.permissions.findOne({
              where: {
                id: permissionId,
              },
              include: [
                {
                  association: ROLES_ALIAS,
                  include: [
                    {
                      association: ROLE_MEMBERS_ALIAS,
                    },
                  ],
                },
              ],
              transaction,
            });
            const roles = await foundPermission.getRoles({ transaction });
            await foundPermission.removeRoles(roles, { transaction });
            return foundPermission;
          }
        );

        await Promise.all(
          permission.roles.map(({ members }) =>
            cache.remove(...members.map(({ id }) => `${AUTH_KEY_PREFIX}:${id}`))
          )
        );

        return Success({ permission });
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
