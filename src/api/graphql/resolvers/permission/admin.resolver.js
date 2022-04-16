import QueryError from "~utils/errors/QueryError";
import { Fail, Success } from "~helpers/response";
import { ROLES_ALIAS } from "~constants/models";
import { ROLE_PERMISSIONS_PREFIX } from "~constants/auth";

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
    async deletePermission(_parent, { id }, { dataSources, t, cache }) {
      try {
        const permission = await dataSources.permissions.findOne({
          where: {
            id,
          },
          include: {
            association: ROLES_ALIAS,
            attributes: ["id"],
            through: {
              attributes: [],
            },
          },
        });
        await Promise.all(
          permission.roles.map((role) =>
            cache.remove(`${ROLE_PERMISSIONS_PREFIX}:${role.id}`)
          )
        );

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
  },
};
