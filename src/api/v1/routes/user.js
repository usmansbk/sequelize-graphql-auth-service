import express from "express";
import upload from "~middlewares/upload";
import UserController from "../controllers/user";

const router = express.Router();

router.post("/picture", upload.single("picture"), UserController.picture);

export default router;
