/* eslint-disable no-unused-vars */
import log from "~config/logger";
import express from "express";
import authMiddleware from "~middlewares/auth";
import { SOMETHING_WENT_WRONG } from "~helpers/constants/i18n";

import authRouter from "./auth";
import userRouter from "./user";

const router = express.Router();

router.get("/ip", (request, response) => response.send(request.ip));

router.use("/auth", authRouter);
router.use("/user", authMiddleware, userRouter);

const errorHandler = (err, req, res, _next) => {
  log.error(err);
  res.status(500).json({
    success: false,
    message: req.t(SOMETHING_WENT_WRONG),
  });
};

router.use(errorHandler);

export default router;
