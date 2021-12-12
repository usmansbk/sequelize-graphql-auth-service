import { Model } from "sequelize";
import bcrypt from "bcrypt";

export default (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
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
          max: {
            args: 100,
            msg: "nameTooLong",
          },
          notNull: {
            msg: "nameRequired",
          },
          notEmpty: {
            msg: "emptyName",
          },
        },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          max: {
            args: 100,
            msg: "nameTooLong",
          },
          notNull: {
            msg: "nameRequired",
          },
          notEmpty: {
            msg: "emptyName",
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
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: "usedEmail",
        },
        validate: {
          isEmail: {
            msg: "invalidEmail",
          },
          notNull: {
            msg: "invalidEmail",
          },
        },
      },
      phoneNumber: {
        type: DataTypes.STRING,
        unique: {
          msg: "usedPhoneNumber",
        },
        validate: {
          notEmpty: {
            msg: "invalidPhoneNumber",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "invalidPassword",
          },
          notNull: {
            msg: "invalidPassword",
          },
        },
      },
      locale: {
        type: DataTypes.STRING,
        defaultValue: "en",
        validate: {
          isAlpha: {
            msg: "invalidLocale",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );

  User.beforeCreate("hash password", async (user) => {
    const plainPassword = user.getDataValue("password");
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    user.setDataValue("password", hashedPassword);
  });
  return User;
};
