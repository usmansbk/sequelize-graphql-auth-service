import * as jwt from "~utils/jwt";
import db from "~db/models";
import { UNAUTHENTICATED } from "~helpers/constants/i18n";
import { AuthenticationError } from "apollo-server-core";

const authMiddleware = async (req, _res, next) => {
  try {
    const token = req.headers.authorization;
    const tokenInfo = jwt.verify(token);
    const user = tokenInfo && (await db.User.findByPk(tokenInfo.sub));

    if (!user) {
      throw new AuthenticationError(UNAUTHENTICATED);
    }

    req.user = user;
    return next();
  } catch (e) {
    return next(e);
  }
};

export default authMiddleware;
