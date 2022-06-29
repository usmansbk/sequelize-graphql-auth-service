import fs from "fs";
import * as jose from "jose";

const getJWKS = async (_req, res, next) => {
  const key = fs.readFileSync("certs/private.pem");
  const keyObject = await jose.importSPKI(key);
  const publicKey = await jose.importPKCS8(keyObject);

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
