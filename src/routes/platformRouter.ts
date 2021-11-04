import express from "express";
import createPlatform from "../controllers/createPlatform";
import retrieveByTitle from "../controllers/retrievePlatformByTitle";
import subscribeUserToPlatform from "../controllers/subscribeUserToPlatform";
import unsubscribeUserFromPlatform from "../controllers/unsubscribeUserFromPlatform";
import { validateToken } from "../middleware/auth";

const platformRouter = express.Router();

platformRouter.post("/", validateToken, createPlatform);
platformRouter.get("/:platformTitle", validateToken, retrieveByTitle);
platformRouter.patch("/:platformTitle/subscribe", validateToken, subscribeUserToPlatform);
platformRouter.patch("/:platformTitle/unsubscribe", validateToken, unsubscribeUserFromPlatform);

export default platformRouter;
