import { Model } from "sequelize";
import { USER_AVATAR_ALIAS } from "~constants/models";
import fileStorage from "~utils/fileStorage";

export default (sequelize, DataTypes) => {
  class File extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      File.belongsTo(models.User, {
        as: USER_AVATAR_ALIAS,
      });
    }
  }
  File.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        validate: {
          isUUID: 4,
        },
      },
      key: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bucket: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      size: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      mimeType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // You can add extra fields like 'status' to enable locking of files
    },
    {
      sequelize,
      modelName: "File",
    }
  );

  File.afterDestroy("delete s3 file", (fileModel) => {
    fileStorage.remove(fileModel.toJSON());
  });
  return File;
};
