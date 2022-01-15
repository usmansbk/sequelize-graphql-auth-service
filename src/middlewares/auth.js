import * as jwt from "~utils/jwt";

const authMiddleware = (req, _res, next) => {
  try {
    const token = req.headers.authorization;
    const userInfo = jwt.verify(token);
    req.userInfo = userInfo;
    return next();
  } catch (e) {
    return next(e);
  }
};

export default authMiddleware;
