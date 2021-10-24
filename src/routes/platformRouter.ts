import express from "express";
import { validateToken } from "../middleware/auth";
import createPlatform from "../controllers/createPlatform";

const router = express.Router();

router.post("/", validateToken, createPlatform);

export default router;
