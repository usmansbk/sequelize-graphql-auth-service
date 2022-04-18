import QueryError from "~utils/errors/QueryError";
import { Fail, Success } from "~helpers/response";
import { ROLE_NOT_FOUND } from "~constants/i18n";

export default {
  Role: {
    permissions(role) {
      if (role.permissions === undefined) {
        return role.getPermissions();
      }
      return role.permissions;
    },
  },
  Query: {
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
          skip: ["members"], // we shouldn't eager-load paginated fields
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
