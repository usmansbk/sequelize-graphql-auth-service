import QueryError from "~utils/errors/QueryError";
import { Fail, Success } from "~helpers/response";
import { ROLE_NOT_FOUND } from "~helpers/constants/i18n";

export default {
  Role: {
    permissions(role) {
      if (role.permissions === undefined) {
        return role.getPermissions();
      }
      return role.permissions;
    },
    permissionCount(role) {
      return role.countPermissions();
    },
    userCount(role) {
      return role.countMembers();
    },
  },
  Query: {
    roles(_parent, { page, filter }, { dataSources }, info) {
      return dataSources.roles.paginate({
        page,
        filter,
        info,
      });
    },
    getRoleMembers(_parent, { id, page, where }, { dataSources }, info) {
      return dataSources.users.paginate({
        page,
        info,
        filter: {
          where,
          include: {
            roles: {
              where: {
                id: {
                  eq: id,
                },
              },
            },
          },
        },
      });
    },
    async getRoleById(_parent, { id }, { dataSources, t }, info) {
      try {
        const role = await dataSources.roles.findOne({
          where: { id },
          info,
          path: "role",
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
};
