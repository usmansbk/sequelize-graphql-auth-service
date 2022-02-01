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
      },
      roleId: {
        type: DataTypes.UUID,
      },
    },
    {
      sequelize,
      modelName: "UserRoles",
    }
  );
  return UserRoles;
};
