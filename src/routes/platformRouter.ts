import express from "express";
import createPlatform from "../controllers/createPlatform";
import retrieveByTitle from "../controllers/retrievePlatformByTitle";
import { validateToken } from "../middleware/auth";

const platformRouter = express.Router();

platformRouter.post("/", validateToken, createPlatform);
platformRouter.get("/:platformTitle", validateToken, retrieveByTitle);

export default platformRouter;
