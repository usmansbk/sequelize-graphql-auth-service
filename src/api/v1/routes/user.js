import express from "express";
import UserController from "../controllers/user";

const router = express.Router();

router.post("/avatar", UserController.uploadAvatar);
router.post("/:id/avatar", UserController.changeAvatar);

export default router;
