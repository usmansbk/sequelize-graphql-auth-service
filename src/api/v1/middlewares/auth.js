import { AuthenticationError } from "apollo-server-core";
import * as jwt from "~utils/jwt";
import db from "~db/models";
import store from "~utils/store";
import { UNAUTHENTICATED } from "~helpers/constants/i18n";

const authMiddleware = async (req, _res, next) => {
  try {
    const token = req.headers.authorization;
    const clientId = req.headers.client_id;

    const tokenInfo = jwt.verify(token);
    const refreshTokenId =
      tokenInfo && (await store.get(`${clientId}:${tokenInfo.sub}`));
    const isLoggedIn = tokenInfo?.rid === refreshTokenId;
    const user = isLoggedIn && (await db.User.findByPk(tokenInfo.sub));

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
