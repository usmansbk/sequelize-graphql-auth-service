/* eslint-disable no-unused-vars */
import express from "express";
import morgan from "morgan";
import TokenError from "~utils/errors/TokenError";
import authMiddleware from "~api/v1/middlewares/auth";
import { SOMETHING_WENT_WRONG } from "~helpers/constants/i18n";

import authRouter from "./auth";
import userRouter from "./user";

const router = express.Router();

router.get("/ip", (request, response) => response.send(request.ip));

router.use(morgan("combined"));
router.use("/auth", authRouter);
router.use("/user", authMiddleware, userRouter);

const errorHandler = (err, req, res, _next) => {
  if (err instanceof TokenError) {
    res.status(401).json({
      success: false,
      message: req.t(err.message),
    });
  } else {
    res.status(500).json({
      success: false,
      message: req.t(SOMETHING_WENT_WRONG),
    });
  }
};

router.use(errorHandler);

export default router;
