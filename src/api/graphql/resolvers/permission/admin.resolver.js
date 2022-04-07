import QueryError from "~utils/errors/QueryError";
import { Fail, Success } from "~helpers/response";

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
    async createPermissions(_parent, { inputs }, { dataSources, t }) {
      try {
        const permissions = await dataSources.permissions.createMany(inputs);
        return Success({ permissions });
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
    async deletePermissions(_parent, { ids }, { dataSources, t }) {
      try {
        await dataSources.permissions.destroyMany(ids);
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
    async detachPermissionFromAllRoles(
      _parent,
      { permissionId },
      { dataSources, db, t }
    ) {
      try {
        const permission = await db.sequelize.transaction(
          async (transaction) => {
            const foundPermission = await dataSources.permissions.findOne({
              where: {
                id: permissionId,
              },
              transaction,
            });
            const roles = await foundPermission.getRoles({ transaction });
            await foundPermission.removeRoles(roles, { transaction });
            return foundPermission;
          }
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
