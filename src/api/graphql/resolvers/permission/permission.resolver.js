import { PERMISSIONS_ALIAS } from "~constants/models";

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
    createPermissions(_parent, { inputs }, { dataSources }) {
      return dataSources.permissions.createMany(inputs);
    },
    updatePermission(_parent, { input: { id, ...values } }, { dataSources }) {
      return dataSources.permissions.update(id, values);
    },
    deletePermissions(_parent, { ids }, { dataSources }) {
      return dataSources.permissions.destroyMany(ids);
    },
  },
};
