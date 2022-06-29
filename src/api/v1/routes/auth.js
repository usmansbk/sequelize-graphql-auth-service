import express from "express";
import timeout from "connect-timeout";
import AuthController from "../controllers/auth";

const router = express.Router();

router.post("/refresh_token", timeout("45s"), AuthController.refreshToken);
router.get("/.well-known/jwks", timeout("60s"), AuthController.getJWKS);

export default router;
