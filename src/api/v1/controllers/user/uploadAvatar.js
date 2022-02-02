import multer from "multer";
import numeral from "numeral";
import uploadProfilePicture from "~api/v1/middlewares/uploadProfilePicture";
import { IMAGE_TOO_LARGE, NOTHING_TO_UPLOAD } from "~helpers/constants/i18n";
import { PROFILE_PICTURE_MAX_FILE_SIZE, BYTES } from "~helpers/constants/files";
import { UserInputError } from "apollo-server-core";

const upload = uploadProfilePicture.single("avatar");

const uploadAvatar = async (req, res) => {
  upload(req, res, async (err) => {
    const { user, files, t } = req;

    if (err instanceof multer.MulterError) {
      let { message } = err;

      if (message === "File too large") {
        message = IMAGE_TOO_LARGE;
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
        if (!req.file) {
          throw new UserInputError(NOTHING_TO_UPLOAD);
        }

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

        if (user.avatar) {
          files.remove(user.avatar);
        }

        await user.update({ avatar: file });

        res.send({
          success: true,
          avatar: file,
        });
      } catch (error) {
        if (req.file) {
          files.remove(req.file);
        }

        res.status(400).send({
          success: false,
          message: t(error.message),
        });
      }
    }
  });
};

export default uploadAvatar;
