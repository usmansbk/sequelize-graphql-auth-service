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
    isPasswordCorrect(password) {
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
            msg: "name_too_long",
          },
          notNull: {
            msg: "firstname_required",
          },
          notEmpty: {
            msg: "empty_firstname",
          },
        },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          max: {
            args: 100,
            msg: "name_too_long",
          },
          notNull: {
            msg: "lastname_required",
          },
          notEmpty: {
            msg: "empty_lastname",
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
        unique: true,
        validate: {
          isEmail: {
            msg: "invalid_email",
          },
        },
      },
      phoneNumber: {
        type: DataTypes.STRING,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "invalid_password",
          },
          notNull: {
            msg: "invalid_password",
          },
        },
      },
      locale: {
        type: DataTypes.STRING,
        defaultValue: "en",
        validate: {
          isAlpha: {
            msg: "invalid_locale",
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
