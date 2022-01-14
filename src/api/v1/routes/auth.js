import express from "express";
import AuthController from "../controllers/auth";

const router = express.Router();

router.post("/refresh_token", AuthController.refreshToken);

export default router;
