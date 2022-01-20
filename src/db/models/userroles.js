import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class UserRoles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // static associate(models) {
    //   // define association here
    // }
  }
  UserRoles.init(
    {
      userId: {
        type: DataTypes.UUID,
        references: {
          model: "User",
        },
      },
      roleId: {
        type: DataTypes.UUID,
        references: {
          model: "Role",
        },
      },
    },
    {
      sequelize,
      modelName: "UserRoles",
    }
  );
  return UserRoles;
};
