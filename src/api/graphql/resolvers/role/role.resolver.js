export default {
  Role: {
    permissions(role) {
      return role.getPermissions();
    },
  },
  Query: {
    roles(_parent, { page }, { dataSources }) {
      return dataSources.roles.paginate({ page });
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
