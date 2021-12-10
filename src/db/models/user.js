import { Model } from "sequelize";

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
          max: 100,
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
          max: 100,
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
          throw new Error("cannot_set_fullname");
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
      hashedPassword: {
        type: DataTypes.STRING(64),
        validate: {
          is: /^[0-9a-f]{64}$/i,
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
  return User;
};
