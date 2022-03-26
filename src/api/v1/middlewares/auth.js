import { AuthenticationError } from "apollo-server-core";
import { UNAUTHENTICATED } from "~constants/i18n";

const authMiddleware = async (req, _res, next) => {
  try {
    const { tokenInfo, sessionId, user } = req;
    const isLoggedIn = tokenInfo && tokenInfo.sid === sessionId;

    if (!(isLoggedIn && user)) {
      throw new AuthenticationError(UNAUTHENTICATED);
    }
    next();
  } catch (e) {
    next(e);
  }
};

export default authMiddleware;
