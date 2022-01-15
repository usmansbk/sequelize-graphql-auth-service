import multer from "multer";
import numeral from "numeral";
import db from "~db/models";
import fileStorage from "~services/fileStorage";
import uploadProfilePicture from "~api/v1/middlewares/uploadProfilePicture";
import { IMAGE_TOO_LARGE, SOMETHING_WENT_WRONG } from "~helpers/constants/i18n";
import { PROFILE_PICTURE_MAX_FILE_SIZE } from "~helpers/constants/upload";
import { BYTES } from "~helpers/constants/numeral";

const upload = uploadProfilePicture.single("avatar");

const { User } = db;

const uploadAvatar = async (req, res) => {
  upload(req, res, async (err) => {
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
        const {
          mimetype: mimeType,
          originalname: name,
          size,
          bucket,
          key,
        } = req.file;

        const file = {
          key,
          bucket,
          name,
          mimeType,
          size,
        };

        const { userInfo } = req;
        const currentUser = await User.findByPk(userInfo.sub);

        if (!currentUser) {
          throw new Error(SOMETHING_WENT_WRONG);
        }

        const oldAvatar = await currentUser.getAvatar();
        if (oldAvatar) {
          fileStorage.remove(oldAvatar.toJSON());
          oldAvatar.destroy();
        }
        const newAvatar = await currentUser.createAvatar(file);

        res.send({
          success: true,
          avatar: newAvatar.toJSON(),
        });
      } catch (error) {
        // remove uploaded file from s3
        fileStorage.remove(req.file);

        res.status(400).send({
          success: false,
          message: req.t(error.message),
        });
      }
    }
  });
};

export default uploadAvatar;
