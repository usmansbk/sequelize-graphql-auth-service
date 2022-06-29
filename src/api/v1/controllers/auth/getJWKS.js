import fs from "fs";
import { pem2jwk } from "pem-jwk";

const getJWKS = async (_req, res, next) => {
  const key = fs.readFileSync("certs/public.pem", "ascii");

  try {
    const jwk = pem2jwk(key);
    res.json({
      keys: [jwk],
    });
  } catch (e) {
    next(e);
  }
};

export default getJWKS;
