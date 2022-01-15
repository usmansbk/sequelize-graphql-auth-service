import * as jwt from "~utils/jwt";

const auth = (req, _res, next) => {
  try {
    const token = req.headers.authorization;
    const userInfo = jwt.verify(token);
    req.userInfo = userInfo;
  } catch (e) {
    next(e);
  }
};

export default auth;
