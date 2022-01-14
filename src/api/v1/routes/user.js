import express from "express";
import UserController from "../controllers/user";

const router = express.Router();

router.post("/picture", UserController.picture);

export default router;
