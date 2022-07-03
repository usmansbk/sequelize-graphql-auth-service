import db from "~db/models";
import jwt from "~utils/jwt";
import otp from "~utils/otp";
import log from "~utils/logger";
import cache from "~utils/cache";
import mailer from "~utils/mailer";
import storage from "~utils/storage";
import analytics from "~services/analytics";
import Sentry from "~services/sentry";
import getUser from "~utils/getUser";
import TokenError from "~utils/errors/TokenError";
import { CLIENTS_CACHE_KEY } from "~helpers/constants/auth";

const contextMiddleware = async (req, _res, next) => {
  const { authorization, client_id: clientId } = req.headers;

  let tokenInfo;
  let sessionId;
  const accessToken = authorization?.split(" ")?.[1];
  let currentUser;
  let isRootUser = false;
  let isAdmin = false;

  let clients = await cache.getJSON(CLIENTS_CACHE_KEY);

  if (!clients) {
    const apps = await db.Application.findAll();
    clients = apps.map((app) => app.clientID);
    await cache.setJSON(CLIENTS_CACHE_KEY, clients, "365 days");
  }

  if (accessToken) {
    try {
      tokenInfo = jwt.verify(accessToken, { clientId });
      sessionId = await cache.get(`${clientId}:${tokenInfo.sub}`);

      currentUser = await getUser(tokenInfo.sub);
      if (currentUser) {
        isRootUser = currentUser.hasRole(["root"]);
        isAdmin = currentUser.hasRole(["admin"]);

        analytics.identify({
          userId: currentUser.id,
          traits: {
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            email: currentUser.email,
            locale: currentUser.locale,
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
    } catch (err) {
      if (!(err instanceof TokenError)) {
        Sentry.captureException(err);
      }
      log.warn({ err });
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
    clients,
    mailer,
    accessToken,
    currentUser,
    locale: currentUser?.locale || req.language,
  };
  return next();
};

export default contextMiddleware;
