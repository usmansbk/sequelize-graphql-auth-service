import { Model } from "sequelize";
import {
  ROLE_NAME_FORMAT_ERROR,
  ROLE_NAME_LEN_ERROR,
} from "~helpers/constants/i18n";
import { USER_ROLE_FOREIGN_KEY } from "~helpers/constants/models";

export default (sequelize, DataTypes) => {
  class Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Role.belongsToMany(models.User, {
        through: models.UserRoles,
        foreignKey: USER_ROLE_FOREIGN_KEY,
      });
    }
  }
  Role.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        validate: {
          isUUID: 4,
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isAlpha: ROLE_NAME_FORMAT_ERROR,
          len: {
            args: [4, 64],
            msg: ROLE_NAME_LEN_ERROR,
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Role",
    }
  );
  return Role;
};
