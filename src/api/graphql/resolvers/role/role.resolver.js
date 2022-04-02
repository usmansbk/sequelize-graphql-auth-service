import { ROLES_ALIAS } from "~constants/models";

export default {
  Role: {
    permissions(role) {
      return role.permissions || role.getPermissions();
    },
    members(role, { page }, { dataSources }, info) {
      return dataSources.users.paginate({
        page,
        info,
        include: [
          {
            association: ROLES_ALIAS,
            where: {
              id: role.id,
            },
          },
        ],
      });
    },
  },
  Query: {
    roles(_parent, { page }, { dataSources }, info) {
      return dataSources.roles.paginate({ page, info });
    },
  },
  Mutation: {
    createRole(
      _parent,
      { input: { permissionIds, ...values } },
      { dataSources, db }
    ) {
      return db.sequelize.transaction(async (transaction) => {
        const role = await dataSources.roles.create(values, { transaction });
        const permissions = await dataSources.permissions.findAll({
          where: { id: permissionIds },
          transaction,
        });
        await role.addPermissions(permissions, { transaction });
        return role;
      });
    },
    updateRole(_parent, { input: { id, ...values } }, { dataSources }) {
      return dataSources.roles.update(id, values);
    },
    deleteRoles(_parent, { ids }, { dataSources }) {
      return dataSources.roles.destroyMany(ids);
    },
  },
};
