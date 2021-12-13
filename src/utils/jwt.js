import jwt from "jsonwebtoken";
const privateKey = process.env.JWT_SECRET_KEY;

/**
 * exp or any other claim is only set if the payload is an object literal.
 * Buffer or string payloads are not checked for JSON validity.
 */
export function sign(payload, expiresIn = "15m") {
  return jwt.sign(payload, privateKey, { expiresIn });
}

export function verify(token) {
  return jwt.verify(token, privateKey);
}
