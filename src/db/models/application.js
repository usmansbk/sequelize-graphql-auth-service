import { nanoid } from "nanoid";
import { Model } from "sequelize";
import {
  APPLICATION_DESCRIPTION_EMPTY_ERROR,
  APPLICATION_DESCRIPTION_LEN_ERROR,
  APPLICATION_NAME_EMPTY_ERROR,
  APPLICATION_NAME_LEN_ERROR,
} from "~helpers/constants/responseCodes";

export default (sequelize, DataTypes) => {
  class Application extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // static associate(models) {
    // define association here
    // }
  }
  Application.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        validate: {
          isUUID: 4,
        },
      },
      clientId: {
        type: DataTypes.STRING,
        defaultValue() {
          return nanoid();
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [1, 100],
            msg: APPLICATION_NAME_LEN_ERROR,
          },
          notNull: {
            msg: APPLICATION_NAME_EMPTY_ERROR,
          },
          notEmpty: {
            msg: APPLICATION_NAME_EMPTY_ERROR,
          },
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [0, 140],
            msg: APPLICATION_DESCRIPTION_LEN_ERROR,
          },
          notEmpty: {
            msg: APPLICATION_DESCRIPTION_EMPTY_ERROR,
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Application",
    }
  );
  return Application;
};
