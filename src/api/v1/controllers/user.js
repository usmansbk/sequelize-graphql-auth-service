import multer from "multer";
import uploadProfilePicture from "~middlewares/uploadProfilePicture";

const upload = uploadProfilePicture.single("picture");
// import db from "~db/models";

// const { User } = db;

const picture = async (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      res.status(400).send({
        success: false,
        message: req.t(err.message),
      });
    } else if (err) {
      res.status(400).send({
        success: false,
        message: req.t(err.message),
      });
    }
    try {
      // const { userInfo } = req;
      // const currentUser = await User.findByPk(userInfo.sub);

      res.send({
        success: true,
        file: req.file,
      });
    } catch (e) {
      res.status(400).send({
        success: false,
        message: req.t(err.message),
      });
    }
  });
};

export default {
  picture,
};
