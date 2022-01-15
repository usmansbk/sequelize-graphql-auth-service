import multer from "multer";
import numeral from "numeral";
import uploadProfilePicture from "~api/v1/middlewares/uploadProfilePicture";
import { IMAGE_TOO_LARGE } from "~helpers/constants/i18n";
import { PROFILE_PICTURE_MAX_FILE_SIZE } from "~helpers/constants/upload";
import { BYTES } from "~helpers/constants/numeral";
import links from "~helpers/links";

const { S3_BUCKET } = process.env;

const upload = uploadProfilePicture.single("avatar");
// import db from "~db/models";

// const { User } = db;

const uploadAvatar = async (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      let { message } = err;

      if (message === "File too large") {
        message = IMAGE_TOO_LARGE;
      }
      res.status(400).send({
        success: false,
        message: req.t(message, {
          size: numeral(PROFILE_PICTURE_MAX_FILE_SIZE).format(BYTES),
        }),
      });
    } else if (err) {
      res.status(400).send({
        success: false,
        message: req.t(err.message),
      });
    } else {
      try {
        // const { userInfo } = req;
        // const currentUser = await User.findByPk(userInfo.sub);
        const {
          mimetype: mimeType,
          originalname: name,
          size,
          bucket,
          key,
        } = req.file;

        const imageRequest = {
          bucket: S3_BUCKET,
          key,
        };

        const file = {
          key,
          bucket,
          name,
          mimeType,
          size,
          thumbnail: links.imageUrl({
            ...imageRequest,
            edits: { resize: { width: 32, height: 32 } },
          }),
          url: links.imageUrl({
            ...imageRequest,
            edits: { resize: { width: 180, height: 180 } },
          }),
        };

        res.send({
          success: true,
          file,
        });
      } catch (e) {
        res.status(400).send({
          success: false,
          message: req.t(err.message),
        });
      }
    }
  });
};

export default uploadAvatar;
