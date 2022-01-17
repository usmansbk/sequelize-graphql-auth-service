import multer from "multer";
import multerS3 from "multer-s3";
import { nanoid } from "nanoid";
import { UserInputError } from "apollo-server-core";
import s3 from "~services/s3";
import { UNSUPPORTED_FILE_TYPE } from "~helpers/constants/i18n";
import {
  AVATARS_FOLDER,
  PROFILE_PICTURE_MAX_FILE_SIZE,
  SUPPORTED_PROFILE_PICTURE_FILE_TYPES,
} from "~helpers/constants/files";

const { S3_BUCKET } = process.env;

const uploadProfilePicture = multer({
  storage: multerS3({
    s3,
    bucket: S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata(_req, file, cb) {
      cb(null, { fieldName: file.fieldname, originalName: file.originalname });
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
      return;
    }
    cb(null, true);
  },
});

export default uploadProfilePicture;
