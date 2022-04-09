/* eslint-disable no-unused-vars */
import express from "express";
import morgan from "morgan";
import authMiddleware from "~api/v1/middlewares/auth";

import authRouter from "./auth";
import userRouter from "./user";

const router = express.Router();

router.get("/ip", (request, response) => response.send(request.ip));

router.use(morgan("combined"));
router.use("/auth", authRouter);
router.use("/user", authMiddleware, userRouter);

export default router;
