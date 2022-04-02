import { Model } from "sequelize";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import sequelizeCache from "sequelize-transparent-cache";
import RedisAdaptor from "sequelize-transparent-cache-ioredis";
import {
  USER_FIRST_NAME_EMPTY_ERROR,
  USER_FIRST_NAME_REQUIRED_ERROR,
  USER_FIRST_NAME_LEN_ERROR,
  USER_LAST_NAME_LEN_ERROR,
  USER_LAST_NAME_REQUIRED_ERROR,
  USER_LAST_NAME_EMPTY_ERROR,
  USER_EMAIL_UNAVAILABLE_ERROR,
  USER_INVALID_EMAIL_ERROR,
  USER_PHONE_NUMBER_FORMAT_ERROR,
  USER_PASSWORD_LEN_ERROR,
  USER_INVALID_PASSWORD_ERROR,
  USER_INVALID_LOCALE_ERROR,
  USER_INVALID_PICTURE_URL_ERROR,
  USER_USERNAME_LEN_ERROR,
  USER_USERNAME_UNAVAILABLE_ERROR,
} from "~constants/i18n";
import {
  PERMISSIONS_ALIAS,
  ROLES_ALIAS,
  USER_ROLES_JOIN_TABLE,
} from "~constants/models";
import client from "~services/redis";
import otp from "~utils/otp";
import fileStorage from "~utils/fileStorage";

const redisAdaptor = new RedisAdaptor({
  client,
  namespace: "model",
  lifetime: 60 * 60,
});

const { withCache } = sequelizeCache(redisAdaptor);

export default (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.belongsToMany(models.Role, {
        as: ROLES_ALIAS,
        through: USER_ROLES_JOIN_TABLE,
      });
    }

    checkPassword(password) {
      return bcrypt.compare(password, this.password);
    }

    hasRole(roles) {
      const userRoles = this.get(ROLES_ALIAS);

      if (!userRoles) {
        throw new Error(
          "Use `defaultScope` or eager loading to fetch user roles."
        );
      }

      return userRoles.some((roleModel) => {
        const { name } = roleModel.toJSON();
        return roles.includes(name);
      });
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
            args: [1, 100],
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
            args: [1, 100],
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
          // throw new Error("Do not try to set the `fullName` value!");
        },
      },
      username: {
        type: DataTypes.STRING,
        unique: {
          msg: USER_USERNAME_UNAVAILABLE_ERROR,
        },
        validate: {
          len: {
            args: [2, 100],
            msg: USER_USERNAME_LEN_ERROR,
          },
          notEmpty: {
            msg: USER_USERNAME_LEN_ERROR,
          },
        },
        defaultValue() {
          return `user${otp.getNumberCode(10)}`;
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
        allowNull: true,
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
        defaultValue() {
          return nanoid(8);
        },
      },
      locale: {
        type: DataTypes.STRING,
        defaultValue: "en",
        validate: {
          isAlpha: {
            msg: USER_INVALID_LOCALE_ERROR,
          },
        },
      },
      avatar: {
        type: DataTypes.JSON,
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
      scopes: {
        permissions: {
          include: [
            {
              association: ROLES_ALIAS,
              include: [{ association: PERMISSIONS_ALIAS }],
            },
          ],
        },
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

  User.afterUpdate("delete avatar file", (userModel) => {
    if (userModel.changed("avatar")) {
      fileStorage.remove(userModel.previous().avatar);
    }
  });

  User.afterDestroy("delete avatar file", (userModel) => {
    const user = userModel.toJSON();
    if (user.avatar) {
      fileStorage.remove(user.avatar);
    }
  });

  return withCache(User);
};
