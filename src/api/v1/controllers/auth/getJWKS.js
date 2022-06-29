import fs from "fs";
import * as jose from "jose";

const getJWKS = async (_req, res, next) => {
  const publicKey = fs.readFileSync("certs/jwtRS256.key.pub");

  try {
    const publicJwk = await jose.exportJWK(publicKey);
    res.json({
      keys: [publicJwk],
    });
  } catch (e) {
    next(e);
  }
};

export default getJWKS;
