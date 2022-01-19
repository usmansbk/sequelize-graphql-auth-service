import { AuthenticationError } from "apollo-server-core";
import { UNAUTHENTICATED } from "~helpers/constants/i18n";

const authMiddleware = async (req, _res, next) => {
  try {
    const token = req.headers.authorization;
    const clientId = req.headers.client_id;

    const tokenInfo = req.jwt.verify(token);
    const sessionId =
      tokenInfo && (await req.store.get(`${clientId}:${tokenInfo.sub}`));
    const isLoggedIn = tokenInfo?.sid === sessionId;
    const user = isLoggedIn && (await req.db.User.findByPk(tokenInfo.sub));

    if (!user) {
      throw new AuthenticationError(UNAUTHENTICATED);
    }

    // TODO: RBAC

    req.user = user;
    return next();
  } catch (e) {
    return next(e);
  }
};

export default authMiddleware;
