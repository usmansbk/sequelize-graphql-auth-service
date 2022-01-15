import * as jwt from "~utils/jwt";
import db from "~db/models";
import TokenError from "~utils/errors/TokenError";
import { UNAUTHORIZED } from "~helpers/constants/i18n";

const authMiddleware = async (req, _res, next) => {
  try {
    const token = req.headers.authorization;
    const userInfo = jwt.verify(token);
    const user = userInfo && (await db.User.findByPk(userInfo.sub));

    if (!user) {
      throw new TokenError(UNAUTHORIZED);
    }

    req.userInfo = userInfo;
    return next();
  } catch (e) {
    return next(e);
  }
};

export default authMiddleware;
