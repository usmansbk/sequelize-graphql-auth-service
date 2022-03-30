import express from "express";
import UserController from "../controllers/user";

const router = express.Router();

router.post("/avatar", UserController.uploadAvatar);

export default router;
