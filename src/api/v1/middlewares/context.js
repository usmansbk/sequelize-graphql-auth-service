import * as jwt from "~utils/jwt";
import db from "~db/models";
import store from "~utils/store";
import * as otp from "~utils/otp";
import fileStorage from "~utils/fileStorage";

const contextMiddleware = async (req, _res, next) => {
  req.db = db;
  req.otp = otp;
  req.store = store;
  req.jwt = jwt;
  req.fileStorage = fileStorage;
  next();
};

export default contextMiddleware;
