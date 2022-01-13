import fs from "fs";
import jwt, {
  NotBeforeError,
  TokenExpiredError,
  JsonWebTokenError,
} from "jsonwebtoken";
import { nanoid } from "nanoid";
import dayjs from "~config/dayjs";
import {
  TOKEN_EXPIRED_ERROR,
  TOKEN_INVALID_ERROR,
  TOKEN_NOT_BEFORE_ERROR,
} from "~helpers/constants/i18n";
import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  supportedClients,
} from "~helpers/constants/tokens";
import TokenError from "./errors/TokenError";

const privateKey = fs.readFileSync(process.env.JWT_PRIVATE_KEY);
const publicKey = fs.readFileSync(process.env.JWT_PUBLIC_KEY);

/**
 * exp or any other claim is only set if the payload is an object literal.
 * Buffer or string payloads are not checked for JSON validity.
 * exp, nbf, aud, sub and iss can be provided in the payload directly, but you can't include in both places.
 */
export function sign(payload, expiresIn = "15m") {
  const id = nanoid();
  const token = jwt.sign(payload, privateKey, {
    jwtid: id,
    expiresIn,
    algorithm: "RS256",
    issuer: process.env.HOST,
  });

  return { token, id };
}

export function verify(token, options = {}) {
  try {
    return jwt.verify(token, publicKey, {
      ...options,
      issuer: process.env.HOST,
      audience: supportedClients,
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
}

export function decode(token) {
  return jwt.decode(token);
}

export function generateToken(payload = {}, expiresIn = "5 minutes") {
  const { token, id } = sign(payload, expiresIn);
  const [time, units] = expiresIn.split(" ");
  const exp = dayjs.duration(Number.parseInt(time, 10), units).asSeconds();

  return { token, exp, id };
}

/**
 *
 * @param { object } payload - JSON payload
 * @param { string } tokenExp - access token expiresIn [time unit]
 * @param { string } refreshTokenExp  - refresh token expiresIn (days)
 * @returns
 */
export function generateAuthTokens(
  { aud, ...payload },
  tokenExp = ACCESS_TOKEN_EXPIRES_IN,
  refreshTokenExp = REFRESH_TOKEN_EXPIRES_IN
) {
  const accessToken = generateToken({ aud, ...payload }, tokenExp);
  const refreshToken = generateToken({ aud }, refreshTokenExp);

  return {
    accessToken: accessToken.token,
    refreshToken: refreshToken.token,
    accessTokenId: accessToken.id,
    refreshTokenId: refreshToken.id,
    exp: refreshToken.exp,
  };
}
