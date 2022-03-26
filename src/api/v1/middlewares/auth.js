import { AuthenticationError } from "apollo-server-core";
import { UNAUTHENTICATED } from "~constants/i18n";

const authMiddleware = async (req, _res, next) => {
  try {
    const { tokenInfo, sessionId, currentUser } = req.context;
    const isLoggedIn = tokenInfo && tokenInfo.sid === sessionId;

    if (!(isLoggedIn && currentUser)) {
      throw new AuthenticationError(UNAUTHENTICATED);
    }
    next();
  } catch (e) {
    next(e);
  }
};

export default authMiddleware;
