import db from "~db/models";
import jwt from "~utils/jwt";
import otp from "~utils/otp";
import log from "~utils/logger";
import cache from "~utils/cache";
import mailer from "~utils/mailer";
import storage from "~utils/storage";
import analytics from "~services/analytics";
import Sentry from "~services/sentry";

const contextMiddleware = async (req, _res, next) => {
  const { authorization, client_id: clientId } = req.headers;

  let tokenInfo;
  let sessionId;
  const accessToken = authorization?.split(" ")?.[1];
  let currentUser;
  let isRootUser = false;
  let isAdmin = false;

  if (accessToken) {
    try {
      tokenInfo = jwt.verify(accessToken);
      sessionId = await cache.get(`${clientId}:${tokenInfo.sub}`);
      const cachedAuthData = await cache.get(tokenInfo.sub);

      if (cachedAuthData) {
        console.log(JSON.parse(cachedAuthData));
      }
      currentUser = await db.User.scope("roles").findByPk(tokenInfo.sub);
      if (currentUser) {
        isRootUser = currentUser.hasRole(["root"]);
        isAdmin = currentUser.hasRole(["admin"]);
        await cache.set({
          key: tokenInfo.sub,
          value: JSON.stringify(currentUser.roles),
          expiresIn: 5 * 60, // 5 minutes
        });

        analytics.identify({
          userId: currentUser.id,
          traits: {
            fullName: currentUser.fullName,
            username: currentUser.username,
            email: currentUser.email,
            locale: currentUser.locale,
          },
          context: {
            clientId,
          },
        });
        Sentry.setUser({
          id: currentUser.id,
          email: currentUser.email,
        });
        if (currentUser.locale) {
          await req.i18n.changeLanguage(currentUser.locale);
        }
      }
    } catch (e) {
      log.warn(e);
    }
  }

  req.context = {
    db,
    otp,
    jwt,
    cache,
    isAdmin,
    isRootUser,
    storage,
    tokenInfo,
    sessionId,
    clientId,
    mailer,
    accessToken,
    currentUser,
    locale: currentUser?.locale || req.language,
  };
  next();
};

export default contextMiddleware;
