import deepmerge from "deepmerge";
import QueryError from "~utils/errors/QueryError";
import { Fail, Success } from "~helpers/response";

export default {
  Permission: {
    roles(permission, { page, filter }, { dataSources }, info) {
      return dataSources.roles.paginate({
        page,
        info,
        filter: deepmerge(filter, {
          include: {
            permissions: {
              where: {
                id: {
                  eq: permission.id,
                },
              },
            },
          },
        }),
      });
    },
  },
  Query: {
    permissions(_parent, { page, filter }, { dataSources }, info) {
      return dataSources.permissions.paginate({ page, filter, info });
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
