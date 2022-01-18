import { Model } from "sequelize";
import bcrypt from "bcrypt";
import {
  FIRST_NAME_EMPTY_ERROR,
  FIRST_NAME_REQUIRED_ERROR,
  FIRST_NAME_LEN_ERROR,
  LAST_NAME_LEN_ERROR,
  LAST_NAME_REQUIRED_ERROR,
  LAST_NAME_EMPTY_ERROR,
  EMAIL_UNAVAILABLE_ERROR,
  INVALID_EMAIL_ERROR,
  PHONE_NUMBER_UNAVAILABLE_ERROR,
  INVALID_PHONE_NUMBER_ERROR,
  PASSWORD_LEN_ERROR,
  INVALID_PASSWORD_ERROR,
  INVALID_LOCALE_ERROR,
  INVALID_URL_ERROR,
  USERNAME_NAME_LEN_ERROR,
} from "~helpers/constants/i18n";
import { AVATAR_ALIAS } from "~helpers/constants/models";

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
        foreignKey: "avatarId",
      });
    }

    checkPassword(password) {
      return bcrypt.compare(password, this.password);
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
            msg: FIRST_NAME_LEN_ERROR,
          },
          notNull: {
            msg: FIRST_NAME_REQUIRED_ERROR,
          },
          notEmpty: {
            msg: FIRST_NAME_EMPTY_ERROR,
          },
        },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [2, 100],
            msg: LAST_NAME_LEN_ERROR,
          },
          notNull: {
            msg: LAST_NAME_REQUIRED_ERROR,
          },
          notEmpty: {
            msg: LAST_NAME_EMPTY_ERROR,
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
            msg: USERNAME_NAME_LEN_ERROR,
          },
          notEmpty: {
            msg: USERNAME_NAME_LEN_ERROR,
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: EMAIL_UNAVAILABLE_ERROR,
        },
        validate: {
          isEmail: {
            msg: INVALID_EMAIL_ERROR,
          },
          notNull: {
            msg: INVALID_EMAIL_ERROR,
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
          msg: PHONE_NUMBER_UNAVAILABLE_ERROR,
        },
        validate: {
          notEmpty: {
            msg: INVALID_PHONE_NUMBER_ERROR,
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [6, 64],
            msg: PASSWORD_LEN_ERROR,
          },
          notEmpty: {
            msg: INVALID_PASSWORD_ERROR,
          },
          notNull: {
            msg: INVALID_PASSWORD_ERROR,
          },
        },
      },
      language: {
        type: DataTypes.STRING,
        defaultValue: "en",
        validate: {
          isAlpha: {
            msg: INVALID_LOCALE_ERROR,
          },
        },
      },
      socialAvatarURL: {
        type: DataTypes.TEXT,
        validate: {
          isUrl: {
            msg: INVALID_URL_ERROR,
          },
        },
      },
    },
    {
      sequelize,
      modelName: "User",
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
