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

  if (accessToken) {
    try {
      tokenInfo = jwt.verify(accessToken);
      sessionId = await store.get(`${clientId}:${tokenInfo.sub}`);
      if (tokenInfo?.lng) {
        // check if logged in user has a preferred language and use it
        await req.i18n.changeLanguage(tokenInfo.lng);
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
  next();
};

export default contextMiddleware;
