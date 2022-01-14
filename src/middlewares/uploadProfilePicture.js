import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";
import { nanoid } from "nanoid";

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
});

export default uploadProfilePicture;
