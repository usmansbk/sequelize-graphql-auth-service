import { AuthenticationError, ForbiddenError } from "apollo-server-core";
import { UNAUTHENTICATED } from "~constants/i18n";
import { ACCOUNT_STATUS } from "~constants/models";

const authMiddleware = async (req, _res, next) => {
  try {
    const { tokenInfo, sessionId, currentUser } = req.context;
    const isLoggedIn = tokenInfo && tokenInfo.sid === sessionId;

    if (!(currentUser && isLoggedIn)) {
      throw new AuthenticationError(UNAUTHENTICATED);
    }

    if (
      [
        ACCOUNT_STATUS.BANNED,
        ACCOUNT_STATUS.SUSPENDED,
        ACCOUNT_STATUS.LOCKED,
      ].includes(currentUser.status)
    ) {
      throw new ForbiddenError(currentUser.status);
    }

    next();
  } catch (e) {
    next(e);
  }
};

export default authMiddleware;
