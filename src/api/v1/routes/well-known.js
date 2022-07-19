import express from "express";
import timeout from "connect-timeout";
import WellKnown from "../controllers/well-known";

const router = express.Router();

router.get("/jwks", timeout("60s"), WellKnown.jwks);
router.get("/assetlinks.json", WellKnown.assetlinks);

export default router;
