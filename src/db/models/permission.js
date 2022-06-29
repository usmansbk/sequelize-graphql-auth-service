import { Model } from "sequelize";
import {
  PERMISSION_SCOPE_UNIQUE_ERROR,
  PERMISSION_SCOPE_LEN_ERROR,
  PERMISSION_DESCRIPTION_EMPTY_ERROR,
  PERMISSION_DESCRIPTION_LEN_ERROR,
  PERMISSION_SCOPE_EMPTY_ERROR,
  PERMISSION_SCOPE_INVALID_FORMAT_ERROR,
} from "~helpers/constants/responseCodes";
import {
  ROLES_ALIAS,
  ROLE_PERMISSIONS_JOIN_TABLE,
} from "~helpers/constants/models";

export default (sequelize, DataTypes) => {
  class Permission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Permission.belongsToMany(models.Role, {
        through: ROLE_PERMISSIONS_JOIN_TABLE,
        as: ROLES_ALIAS,
      });
    }
  }
  Permission.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        validate: {
          isUUID: 4,
        },
      },
      scope: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: PERMISSION_SCOPE_UNIQUE_ERROR,
        },
        validate: {
          is: {
            args: /^[a-zA-Z]+(:[a-zA-Z]+)*$/g,
            msg: PERMISSION_SCOPE_INVALID_FORMAT_ERROR,
          },
          notEmpty: {
            msg: PERMISSION_SCOPE_EMPTY_ERROR,
          },
          notNull: {
            msg: PERMISSION_SCOPE_EMPTY_ERROR,
          },
          len: {
            args: [1, 280],
            msg: PERMISSION_SCOPE_LEN_ERROR,
          },
        },
        set(value) {
          this.setDataValue("scope", value.toLowerCase());
        },
      },
      description: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            msg: PERMISSION_DESCRIPTION_EMPTY_ERROR,
          },
          len: {
            args: [0, 280],
            msg: PERMISSION_DESCRIPTION_LEN_ERROR,
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Permission",
    }
  );
  return Permission;
};
