import db from "~db/models";
import jwt from "~utils/jwt";
import otp from "~utils/otp";
import log from "~utils/logger";
import cache from "~utils/cache";
import mailer from "~utils/mailer";
import storage from "~utils/storage";
import analytics from "~services/analytics";
import Sentry from "~services/sentry";
import getUser from "~helpers/getUser";
import TokenError from "~utils/errors/TokenError";

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

      currentUser = await getUser(tokenInfo.sub);
      if (currentUser) {
        isRootUser = currentUser.hasRole(["root"]);
        isAdmin = currentUser.hasRole(["admin"]);

        analytics.identify({
          userId: currentUser.id,
        });
        Sentry.setUser({
          id: currentUser.id,
        });
        if (currentUser.locale) {
          await req.i18n.changeLanguage(currentUser.locale);
        }
      }
    } catch (e) {
      if (!(e instanceof TokenError)) {
        Sentry.captureException(e);
      }
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
