import db from "~db/models";

const { User } = db;

const picture = async (req, res) => {
  try {
    const { userInfo } = req;
    const currentUser = await User.findByPk(userInfo.sub);
    console.log(currentUser);

    res.send({
      success: true,
      file: req.file,
    });
  } catch (e) {
    res.status(400).send({
      success: false,
      message: req.t(e.message),
    });
  }
};

export default {
  picture,
};
