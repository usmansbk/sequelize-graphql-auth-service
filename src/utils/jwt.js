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
import TokenError from "./errors/TokenError";

const cert = fs.readFileSync(process.env.JWT_SECRET_KEY);

/**
 * exp or any other claim is only set if the payload is an object literal.
 * Buffer or string payloads are not checked for JSON validity.
 * exp, nbf, aud, sub and iss can be provided in the payload directly, but you can't include in both places.
 */
export function sign(payload, expiresIn = "15m") {
  return jwt.sign(payload, cert, {
    expiresIn,
    issuer: process.env.HOST,
    algorithm: ["RS256"],
  });
}

export function verify(token) {
  try {
    return jwt.verify(token, cert);
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

/**
 *
 * @param { object } payload - JSON payload
 * @param { number } tokenExp - access token expiresIn (minutes)
 * @param { number } refreshTokenExp  - refresh token expiresIn (days)
 * @returns
 */
export function generateAuthTokens(
  payload = {},
  tokenExp = 15,
  refreshTokenExp = 2
) {
  const tokenId = nanoid();
  const accessToken = sign(payload, `${tokenExp}m`);
  const refreshToken = sign({ tokenId }, `${refreshTokenExp}d`);
  const ex = dayjs.duration(refreshTokenExp, "days").asSeconds();

  return { accessToken, refreshToken, ex, tokenId };
}

export function getToken(payload = {}, expiresIn = 5) {
  const token = sign(payload, `${expiresIn}m`);
  const ex = dayjs.duration(expiresIn, "minutes").asSeconds();

  return { token, ex };
}
