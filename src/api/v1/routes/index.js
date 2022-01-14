import express from "express";

import authRouter from "./auth";
import userRouter from "./user";

const router = express.Router();

router.get("/ip", (request, response) => response.send(request.ip));

router.use("/auth", authRouter);
router.use("/user", userRouter);

export default router;
