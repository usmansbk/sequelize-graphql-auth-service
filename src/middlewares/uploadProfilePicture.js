import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";
import { nanoid } from "nanoid";
import { UNSUPPORTED_FILE_TYPE } from "~helpers/constants/i18n";

const { AWS_REGION, S3_BUCKET } = process.env;

const s3 = new aws.S3({ region: AWS_REGION });

const uploadProfilePicture = multer({
  storage: multerS3({
    s3,
    bucket: S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata(_req, file, cb) {
      cb(null, { fieldName: file.fieldname, originalName: file.originalname });
    },
    key(_req, _file, cb) {
      cb(null, `avatar/${nanoid()}`);
    },
  }),
  limits: {
    fileSize: 1024 * 1024, // 1MB
  },
  fileFilter(req, file, cb) {
    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.mimetype)) {
      cb(new Error(req.t(UNSUPPORTED_FILE_TYPE)));
    }
    cb(null, true);
  },
});

export default uploadProfilePicture;
