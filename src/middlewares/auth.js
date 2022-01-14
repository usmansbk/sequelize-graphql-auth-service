import * as jwt from "~utils/jwt";
import { UNAUTHORIZED } from "~helpers/constants/i18n";

const auth = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    res.status(401).json({
      succes: false,
      message: req.t(UNAUTHORIZED),
    });
    return;
  }

  const userInfo = jwt.verify(token);
  req.userInfo = userInfo;
  next();
};

export default auth;
