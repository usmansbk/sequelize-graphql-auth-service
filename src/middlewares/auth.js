import * as jwt from "~utils/jwt";
import TokenError from "~utils/errors/TokenError";
import { UNAUTHORIZED } from "~helpers/constants/i18n";

const authMiddleware = (req, _res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      throw new TokenError(UNAUTHORIZED);
    }

    const userInfo = jwt.verify(token);
    req.userInfo = userInfo;
    return next();
  } catch (e) {
    return next(e);
  }
};

export default authMiddleware;
