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
} from "~helpers/constants";
import TokenError from "./errors/TokenError";

const privateKey = process.env.JWT_SECRET_KEY;

/**
 * exp or any other claim is only set if the payload is an object literal.
 * Buffer or string payloads are not checked for JSON validity.
 */
export function sign(payload, expiresIn = "15m") {
  return jwt.sign(payload, privateKey, { expiresIn });
}

export function verify(token) {
  try {
    return jwt.verify(token, privateKey);
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

export function getAuthTokens(payload = {}) {
  const tokenExpiresIn = 15; // minutes
  const rfExpiresIn = 2; // days
  const tokenId = nanoid();
  const accessToken = sign({ ...payload, tokenId }, `${tokenExpiresIn}m`);
  const refreshToken = sign({}, `${rfExpiresIn}d`);
  const expiresIn = dayjs.duration(rfExpiresIn, "days").asSeconds();

  return { accessToken, refreshToken, tokenId, expiresIn };
}
