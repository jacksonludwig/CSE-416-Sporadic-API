import express from "express";
import { validateToken } from "../middleware/auth";
import createPlatform from "../controllers/createPlatform";

const platformRouter = express.Router();

platformRouter.post("/", validateToken, createPlatform);

export default platformRouter;
