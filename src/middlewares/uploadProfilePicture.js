import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";
import { nanoid } from "nanoid";

const { NODE_ENV, AWS_REGION, S3_BUCKET } = process.env;

let options;

if (NODE_ENV === "development") {
  const s3 = new aws.S3({ region: AWS_REGION });

  options = {
    storage: multerS3({
      s3,
      bucket: S3_BUCKET,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      metadata(_req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key(_req, _file, cb) {
        cb(null, nanoid());
      },
    }),
  };
} else {
  options = { dest: "uploads/" };
}

const upload = multer(options);

export default upload;
