import fs from "fs";
import { createPublicKey } from "crypto";

const jwks = async (_req, res, next) => {
  const privateKey = fs.readFileSync("certs/private.pem", "ascii");

  try {
    const jwk = createPublicKey(privateKey).export({ format: "jwk" });
    res.json({
      keys: [jwk],
    });
  } catch (e) {
    next(e);
  }
};

export default jwks;
