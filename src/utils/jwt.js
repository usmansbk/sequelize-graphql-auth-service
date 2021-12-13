import jwt from "jsonwebtoken";
import { INVALID_JWT_TOKEN } from "~helpers/constants";
const privateKey = process.env.JWT_SECRET_KEY;

/**
 * exp or any other claim is only set if the payload is an object literal.
 * Buffer or string payloads are not checked for JSON validity.
 */
export function sign(payload, expiresIn = "15m") {
  const token = jwt.sign(payload, privateKey, { expiresIn });

  return token;
}

export function verify(token) {
  try {
    return jwt.verify(token, privateKey);
  } catch (error) {
    throw new Error(INVALID_JWT_TOKEN);
  }
}
