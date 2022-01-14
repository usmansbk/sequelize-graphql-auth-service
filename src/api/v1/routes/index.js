import express from "express";
import authMiddleware from "~middlewares/auth";

import authRouter from "./auth";
import userRouter from "./user";

const router = express.Router();

router.get("/ip", (request, response) => response.send(request.ip));

router.use("/auth", authRouter);
router.use("/user", authMiddleware, userRouter);

export default router;
