import express from "express";

import authRouter from "./auth";

const router = express.Router();

router.get("/ip", (request, response) => response.send(request.ip));

router.use("/auth", authRouter);

export default router;
