/* eslint-disable no-unused-vars */
import express from "express";
import authMiddleware from "~middlewares/auth";

import authRouter from "./auth";
import userRouter from "./user";

const router = express.Router();

router.get("/ip", (request, response) => response.send(request.ip));

router.use("/auth", authRouter);
router.use("/user", authMiddleware, userRouter);

const errorHandler = (err, req, res, _next) => {
  res.status(400).json({
    success: false,
    message: req.t(err.message),
  });
};

router.use(errorHandler);

export default router;
