import * as jwt from "~utils/jwt";

const auth = (req, _res, next) => {
  const token = req.headers.authorization;

  const userInfo = jwt.verify(token);

  req.userInfo = userInfo;

  next();
};

export default auth;
