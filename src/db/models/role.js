import { Model } from "sequelize";
import {
  ROLE_DESCRIPTION_EMPTY_ERROR,
  ROLE_DESCRIPTION_LEN_ERROR,
  ROLE_NAME_LEN_ERROR,
} from "~constants/i18n";
import {
  PERMISSIONS_ALIAS,
  ROLE_MEMBERS_ALAIS,
  ROLE_PERMISSIONS_JOIN_TABLE,
  USER_ROLES_JOIN_TABLE,
} from "~constants/models";

export default (sequelize, DataTypes) => {
  class Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Role.belongsToMany(models.User, {
        as: ROLE_MEMBERS_ALAIS,
        through: USER_ROLES_JOIN_TABLE,
      });
      Role.belongsToMany(models.Permission, {
        as: PERMISSIONS_ALIAS,
        through: ROLE_PERMISSIONS_JOIN_TABLE,
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
          len: {
            args: [1, 64],
            msg: ROLE_NAME_LEN_ERROR,
          },
        },
      },
      description: {
        type: DataTypes.TEXT,
        validate: {
          len: {
            args: [0, 100],
            msg: ROLE_DESCRIPTION_LEN_ERROR,
          },
          notEmpty: {
            msg: ROLE_DESCRIPTION_EMPTY_ERROR,
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Role",
      scopes: {
        permissions: {
          include: [{ association: PERMISSIONS_ALIAS }],
        },
      },
    }
  );
  return Role;
};
