import multer from "multer";
import numeral from "numeral";
import multerS3 from "multer-s3";
import { nanoid } from "nanoid";
import { UserInputError } from "apollo-server-core";
import { s3Client } from "~services/aws";
import {
  IMAGE_TOO_LARGE,
  NOTHING_TO_UPLOAD,
  UNSUPPORTED_FILE_TYPE,
  USER_PROFILE_PICTURE_UPLOADED,
} from "~helpers/constants/responseCodes";
import {
  AVATARS_FOLDER,
  SUPPORTED_PROFILE_PICTURE_FILE_TYPES,
  PROFILE_PICTURE_MAX_FILE_SIZE,
  BYTES,
} from "~helpers/constants/files";
import { getImageUrl } from "~helpers/links";

const { S3_BUCKET } = process.env;

const changeAvatar = async (req, res) => {
  const upload = multer({
    storage: multerS3({
      s3: s3Client,
      bucket: S3_BUCKET,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      metadata(_req, file, cb) {
        cb(null, {
          fieldName: file.fieldname,
          originalName: file.originalname,
        });
      },
      key(_req, _file, cb) {
        cb(null, `${AVATARS_FOLDER}/${nanoid()}`);
      },
    }),
    limits: {
      fileSize: PROFILE_PICTURE_MAX_FILE_SIZE,
    },
    fileFilter(_req, file, cb) {
      if (!SUPPORTED_PROFILE_PICTURE_FILE_TYPES.includes(file.mimetype)) {
        cb(new UserInputError(UNSUPPORTED_FILE_TYPE));
      } else {
        cb(null, true);
      }
    },
  }).single("avatar");

  upload(req, res, async (err) => {
    const {
      context: { storage, db },
      t,
      file,
      params: { id },
    } = req;

    if (err instanceof multer.MulterError) {
      let { message } = err;

      if (message === "File too large") {
        message = IMAGE_TOO_LARGE;
      }
      if (file) {
        storage.remove(file);
      }
      res.status(400).send({
        success: false,
        message: t(message, {
          size: numeral(PROFILE_PICTURE_MAX_FILE_SIZE).format(BYTES),
        }),
      });
    } else if (err) {
      res.status(400).send({
        success: false,
        message: t(err.message),
      });
    } else {
      try {
        if (!file) {
          throw new UserInputError(NOTHING_TO_UPLOAD);
        }

        const {
          mimetype: mimeType,
          originalname: name,
          size,
          bucket,
          key,
        } = file;

        const input = {
          key,
          bucket,
          name,
          mimeType,
          size,
        };

        const avatar = await db.sequelize.transaction(async (transaction) => {
          const user = await db.User.findByPk(id, { transaction });
          const existingAvatar = await user.getAvatar();
          if (existingAvatar) {
            await existingAvatar.destroy({ transaction });
          }
          return user.createAvatar(input, { transaction });
        });

        res.send({
          code: USER_PROFILE_PICTURE_UPLOADED,
          success: true,
          message: t(USER_PROFILE_PICTURE_UPLOADED),
          user: {
            id,
            avatar: getImageUrl(avatar.toJSON()),
          },
        });
      } catch (error) {
        res.status(400).send({
          success: false,
          message: t(error.message),
        });
      }
    }
  });
};

export default changeAvatar;
