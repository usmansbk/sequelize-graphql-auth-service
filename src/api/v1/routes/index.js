/* eslint-disable no-unused-vars */
import express from "express";
import morgan from "morgan";
import auth from "~api/v1/middlewares/auth";
import verifyClient from "~api/v1/middlewares/verifyClient";
import wellKnownRouter from "./well-known";
import authRouter from "./auth";
import userRouter from "./user";

const router = express.Router();

router.use(verifyClient);
router.get("/ip", (request, response) => response.send(request.ip));

router.use(morgan("combined"));
router.use("/auth", authRouter);
router.use("/user", auth(), userRouter);
router.use("/.well-known", wellKnownRouter);

export default router;
