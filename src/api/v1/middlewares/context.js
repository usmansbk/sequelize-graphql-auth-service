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
  const accessToken = authorization?.split(" ")[1];
  let user;

  if (accessToken) {
    try {
      tokenInfo = jwt.verify(accessToken);
      sessionId = await store.get(`${clientId}:${tokenInfo.sub}`);
      user = await db.User.findByPk(tokenInfo.sub);
      if (user?.language) {
        await req.i18n.changeLanguage(user?.language);
      }
    } catch (e) {
      log.warn(e.message);
    }
  }

  req.db = db;
  req.otp = otp;
  req.jwt = jwt;
  req.store = store;
  req.fileStorage = fileStorage;
  req.tokenInfo = tokenInfo;
  req.sessionId = sessionId;
  req.clientId = clientId;
  req.mailer = mailer;
  req.accessToken = accessToken;
  req.user = user;
  next();
};

export default contextMiddleware;
