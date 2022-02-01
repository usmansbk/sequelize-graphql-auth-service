import { Model } from "sequelize";
import bcrypt from "bcrypt";
import {
  USER_FIRST_NAME_EMPTY_ERROR,
  USER_FIRST_NAME_REQUIRED_ERROR,
  USER_FIRST_NAME_LEN_ERROR,
  USER_LAST_NAME_LEN_ERROR,
  USER_LAST_NAME_REQUIRED_ERROR,
  USER_LAST_NAME_EMPTY_ERROR,
  USER_EMAIL_UNAVAILABLE_ERROR,
  USER_INVALID_EMAIL_ERROR,
  USER_PHONE_NUMBER_UNAVAILABLE_ERROR,
  USER_PHONE_NUMBER_FORMAT_ERROR,
  USER_PASSWORD_LEN_ERROR,
  USER_INVALID_PASSWORD_ERROR,
  USER_INVALID_LOCALE_ERROR,
  USER_INVALID_PICTURE_URL_ERROR,
  USER_USERNAME_LEN_ERROR,
} from "~helpers/constants/i18n";
import {
  AVATAR_ALIAS,
  ROLES_ALIAS,
  USER_AVATAR_FOREIGN_KEY,
  USER_ROLE_FOREIGN_KEY,
} from "~helpers/constants/models";

export default (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.belongsTo(models.File, {
        as: AVATAR_ALIAS,
        foreignKey: USER_AVATAR_FOREIGN_KEY,
      });
      User.belongsToMany(models.Role, {
        as: ROLES_ALIAS,
        through: models.UserRoles,
        foreignKey: USER_ROLE_FOREIGN_KEY,
      });
    }

    checkPassword(password) {
      return bcrypt.compare(password, this.password);
    }

    hasRole(role) {
      const roles = this.get(ROLES_ALIAS);
      return roles.some(({ name }) => name === role);
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        validate: {
          isUUID: 4,
        },
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [2, 100],
            msg: USER_FIRST_NAME_LEN_ERROR,
          },
          notNull: {
            msg: USER_FIRST_NAME_REQUIRED_ERROR,
          },
          notEmpty: {
            msg: USER_FIRST_NAME_EMPTY_ERROR,
          },
        },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [2, 100],
            msg: USER_LAST_NAME_LEN_ERROR,
          },
          notNull: {
            msg: USER_LAST_NAME_REQUIRED_ERROR,
          },
          notEmpty: {
            msg: USER_LAST_NAME_EMPTY_ERROR,
          },
        },
      },
      fullName: {
        type: DataTypes.VIRTUAL,
        get() {
          return [this.firstName, this.lastName].join(" ");
        },
        set() {
          throw new Error("Do not try to set the `fullName` value!");
        },
      },
      userName: {
        type: DataTypes.STRING,
        validate: {
          len: {
            args: [2, 100],
            msg: USER_USERNAME_LEN_ERROR,
          },
          notEmpty: {
            msg: USER_USERNAME_LEN_ERROR,
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: USER_EMAIL_UNAVAILABLE_ERROR,
        },
        validate: {
          isEmail: {
            msg: USER_INVALID_EMAIL_ERROR,
          },
          notNull: {
            msg: USER_INVALID_EMAIL_ERROR,
          },
        },
      },
      emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      phoneNumberVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        unique: {
          msg: USER_PHONE_NUMBER_UNAVAILABLE_ERROR,
        },
        validate: {
          notEmpty: {
            msg: USER_PHONE_NUMBER_FORMAT_ERROR,
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [6, 64],
            msg: USER_PASSWORD_LEN_ERROR,
          },
          notEmpty: {
            msg: USER_INVALID_PASSWORD_ERROR,
          },
          notNull: {
            msg: USER_INVALID_PASSWORD_ERROR,
          },
        },
      },
      language: {
        type: DataTypes.STRING,
        defaultValue: "en",
        validate: {
          isAlpha: {
            msg: USER_INVALID_LOCALE_ERROR,
          },
        },
      },
      socialAvatarURL: {
        type: DataTypes.TEXT,
        validate: {
          isUrl: {
            msg: USER_INVALID_PICTURE_URL_ERROR,
          },
        },
      },
    },
    {
      sequelize,
      modelName: "User",
      defaultScope: {
        include: [{ association: ROLES_ALIAS }, { association: AVATAR_ALIAS }],
      },
    }
  );

  const hashPassword = async (user) => {
    if (user.changed("password")) {
      const plainPassword = user.getDataValue("password");
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      user.setDataValue("password", hashedPassword);
    }
  };

  User.beforeCreate("hash password", hashPassword);
  User.beforeUpdate("hash password", hashPassword);
  User.beforeUpdate("unverify new phone number", (user) => {
    if (user.changed("phoneNumber")) {
      user.setDataValue("phoneNumberVerified", false);
    }
  });
  return User;
};
