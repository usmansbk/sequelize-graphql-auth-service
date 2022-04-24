import express from "express";
import UserController from "../controllers/user";
import auth from "../middlewares/auth";

const router = express.Router();

router.post("/avatar", UserController.uploadAvatar);
router.post(
  "/:id/avatar",
  auth({ roles: ["admin"] }),
  UserController.changeAvatar
);

export default router;
