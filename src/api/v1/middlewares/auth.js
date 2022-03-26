import { AuthenticationError } from "apollo-server-core";
import { UNAUTHENTICATED } from "~constants/i18n";

const authMiddleware = async (req, _res, next) => {
  try {
    const { tokenInfo, sessionId, db } = req;
    const isLoggedIn = tokenInfo && tokenInfo.sid === sessionId;
    const user = isLoggedIn && (await db.User.findByPk(tokenInfo.sub));

    if (!user) {
      throw new AuthenticationError(UNAUTHENTICATED);
    }

    req.user = user;
    next();
  } catch (e) {
    next(e);
  }
};

export default authMiddleware;
