import jwt from "~utils/jwt";

const login = (user) => {
  const { id, language } = user;
  return jwt.generateAuthTokens({
    sub: id,
    aud: process.env.TEST_CLIENT_ID,
    lng: language,
  });
};

export default login;
