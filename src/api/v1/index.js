import express from "express";

const router = express.Router();

router.get("/ip", (request, response) => response.send(request.ip));

export default router;
