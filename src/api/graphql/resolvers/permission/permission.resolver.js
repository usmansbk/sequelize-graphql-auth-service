import { PERMISSIONS_ALIAS } from "~constants/models";
import QueryError from "~utils/errors/QueryError";
import { Fail, Success } from "~helpers/response";

export default {
  Permission: {
    roles(permission, { page }, { dataSources }, info) {
      return dataSources.roles.paginate({
        page,
        info,
        include: [
          {
            association: PERMISSIONS_ALIAS,
            where: {
              id: permission.id,
            },
          },
        ],
      });
    },
  },
  Query: {
    permissions(_parent, { page }, { dataSources }, info) {
      return dataSources.permissions.paginate({ page, info });
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
  },
};
