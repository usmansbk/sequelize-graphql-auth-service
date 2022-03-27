import jwt from "~utils/jwt";
import otp from "~utils/otp";
import db from "~db/models";
import log from "~utils/logger";
import store from "~utils/store";
import mailer from "~utils/mailer";
import fileStorage from "~utils/fileStorage";

const contextMiddleware = async (req, _res, next) => {
  const { authorization, client_id: clientId } = req.headers;

  let tokenInfo;
  let sessionId;
  const accessToken = authorization?.split(" ")?.[1];
  let currentUser;

  if (accessToken) {
    try {
      tokenInfo = jwt.verify(accessToken);
      sessionId = await store.get(`${clientId}:${tokenInfo.sub}`);
      currentUser = await db.User.scope("permissions").findByPk(tokenInfo.sub);
      if (currentUser?.language) {
        await req.i18n.changeLanguage(currentUser.language);
      }
    } catch (e) {
      log.warn(e.message);
    }
  }

  req.context = {
    db,
    otp,
    jwt,
    store,
    fileStorage,
    tokenInfo,
    sessionId,
    clientId,
    mailer,
    accessToken,
    currentUser,
  };
  next();
};

export default contextMiddleware;
