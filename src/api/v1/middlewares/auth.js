import { AuthenticationError, ForbiddenError } from "apollo-server-core";
import { INVALID_CLIENT_ID, UNAUTHENTICATED } from "~constants/i18n";
import { ACCOUNT_STATUS } from "~constants/models";

const authMiddleware = async (req, _res, next) => {
  try {
    const { tokenInfo, sessionId, currentUser, clientId, jwt } = req.context;
    const isLoggedIn = tokenInfo && tokenInfo.sid === sessionId;

    if (!jwt.audience.includes(clientId)) {
      throw new AuthenticationError(INVALID_CLIENT_ID);
    }

    if (!(currentUser && isLoggedIn)) {
      throw new AuthenticationError(UNAUTHENTICATED);
    }

    if (
      [
        ACCOUNT_STATUS.BLOCKED,
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
