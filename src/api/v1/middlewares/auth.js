import { AuthenticationError } from "apollo-server-core";
import { UNAUTHENTICATED } from "~helpers/constants/i18n";
import { AVATAR_ALIAS, ROLES_ALIAS } from "~helpers/constants/models";

const authMiddleware = async (req, _res, next) => {
  try {
    const { tokenInfo, sessionId, db } = req;
    const isLoggedIn = tokenInfo && tokenInfo.sid === sessionId;
    const user =
      isLoggedIn &&
      (await db.User.findOne({
        where: {
          id: tokenInfo.sub,
        },
        include: [
          {
            model: db.File,
            as: AVATAR_ALIAS,
          },
          {
            model: db.Role,
            as: ROLES_ALIAS,
          },
        ],
      }));

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
