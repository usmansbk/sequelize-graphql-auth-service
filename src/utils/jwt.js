import fs from "fs";
import jwt, {
  NotBeforeError,
  TokenExpiredError,
  JsonWebTokenError,
} from "jsonwebtoken";
import { nanoid } from "nanoid";
import verifyGoogleToken from "~services/googleOAuth";
import verifyFacebookToken from "~services/facebookOAuth";
import {
  TOKEN_EXPIRED_ERROR,
  TOKEN_INVALID_ERROR,
  TOKEN_NOT_BEFORE_ERROR,
} from "~helpers/constants/responseCodes";
import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  FACEBOOK_PROVIDER,
  GOOGLE_PROVIDER,
} from "~helpers/constants/auth";
import TokenError from "./errors/TokenError";

const { JWT_PUBLIC_KEY, JWT_PRIVATE_KEY } = process.env;
const privateKey = fs.readFileSync(JWT_PRIVATE_KEY);
const publicKey = fs.readFileSync(JWT_PUBLIC_KEY);

/**
 * exp or any other claim is only set if the payload is an object literal.
 * Buffer or string payloads are not checked for JSON validity.
 * exp, nbf, aud, sub and iss can be provided in the payload directly, but you can't include in both places.
 */
const sign = (payload, expiresIn = "15m") => {
  const id = nanoid();
  const token = jwt.sign(payload, privateKey, {
    jwtid: id,
    expiresIn,
    issuer: process.env.HOST,
    algorithm: "RS256",
  });

  return { token, id };
};

const verify = (token, options = {}) => {
  try {
    return jwt.verify(token, publicKey, {
      ...options,
      issuer: process.env.HOST,
    });
  } catch (e) {
    if (e instanceof NotBeforeError) {
      throw new TokenError(TOKEN_NOT_BEFORE_ERROR, e);
    } else if (e instanceof TokenExpiredError) {
      throw new TokenError(TOKEN_EXPIRED_ERROR, e);
    } else if (e instanceof JsonWebTokenError) {
      throw new TokenError(TOKEN_INVALID_ERROR, e);
    } else {
      throw e;
    }
  }
};

const decode = (token) => jwt.decode(token);

const generateToken = (payload = {}, expiresIn = "5 minutes") => {
  const { token, id } = sign(payload, expiresIn);

  return { token, exp: expiresIn, id };
};

/**
 *
 * @param { object } payload - JSON payload
 * @param { string } tokenExp - access token expiresIn [time unit]
 * @param { string } refreshTokenExp  - refresh token expiresIn (days)
 * @returns
 */
const generateAuthTokens = async (
  { aud, sub },
  tokenExp = ACCESS_TOKEN_EXPIRES_IN,
  refreshTokenExp = REFRESH_TOKEN_EXPIRES_IN
) => {
  const refreshToken = generateToken({ aud }, refreshTokenExp);
  const accessToken = generateToken(
    { aud, sub, sid: refreshToken.id },
    tokenExp
  );

  return {
    accessToken: accessToken.token,
    refreshToken: refreshToken.token,
    sid: refreshToken.id,
    exp: refreshToken.exp,
  };
};

const verifySocialToken = async ({ provider, token }) => {
  let userInfo;
  switch (provider) {
    case GOOGLE_PROVIDER:
      userInfo = await verifyGoogleToken(token);
      break;
    case FACEBOOK_PROVIDER:
      userInfo = await verifyFacebookToken(token);
      break;
    default:
      break;
  }

  return userInfo;
};

export default {
  sign,
  verify,
  decode,
  generateToken,
  generateAuthTokens,
  verifySocialToken,
};
