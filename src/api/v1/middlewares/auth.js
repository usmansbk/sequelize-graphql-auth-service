import { AuthenticationError, ForbiddenError } from "apollo-server-core";
import {
  INVALID_CLIENT_ID,
  UNAUTHENTICATED,
  UNAUTHORIZED,
} from "~constants/i18n";
import { ACCOUNT_STATUS } from "~constants/models";

const authMiddleware = (rules) => async (req, _res, next) => {
  try {
    const { tokenInfo, sessionId, currentUser, clientId, jwt, isRootUser } =
      req.context;
    const isLoggedIn = tokenInfo && tokenInfo.sid === sessionId;

    if (!jwt.audience.includes(clientId)) {
      throw new AuthenticationError(INVALID_CLIENT_ID);
    }

    if (!(currentUser && isLoggedIn)) {
      throw new AuthenticationError(UNAUTHENTICATED);
    }

    if (
      [ACCOUNT_STATUS.BLOCKED, ACCOUNT_STATUS.LOCKED].includes(
        currentUser.status
      )
    ) {
      throw new ForbiddenError(currentUser.status);
    }

    if (!isRootUser && rules) {
      const { roles } = rules;
      if (roles) {
        const granted = currentUser.hasRole(roles);
        if (!granted) {
          throw new ForbiddenError(UNAUTHORIZED);
        }
      }
    }

    next();
  } catch (e) {
    next(e);
  }
};

export default authMiddleware;
