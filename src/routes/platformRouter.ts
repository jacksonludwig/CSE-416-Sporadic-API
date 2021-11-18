import express from "express";
import createPlatform from "../controllers/createPlatform";
import retrieveByTitle from "../controllers/retrievePlatformByTitle";
import subscribeUserToPlatform from "../controllers/subscribeUserToPlatform";
import unsubscribeUserFromPlatform from "../controllers/unsubscribeUserFromPlatform";
import updateModerators from "../controllers/updateModerators";
import updateTotalQuestions from "../controllers/updateTotalQuestions";
import updateTotalScores from "../controllers/updateTotalScores";

import { validateToken } from "../middleware/auth";


const platformRouter = express.Router();
platformRouter.use(validateToken);

platformRouter.post("/", createPlatform);

platformRouter.get("/:platformTitle", retrieveByTitle);

platformRouter.patch("/:platformTitle/subscribe", subscribeUserToPlatform);
platformRouter.patch("/:platformTitle/unsubscribe", unsubscribeUserFromPlatform);

platformRouter.put("/:platformTitle/updateModerators", updateModerators)

platformRouter.patch("/:platformTitle/updateTotalQuestions", updateTotalQuestions);
platformRouter.put("/:platformTitle/updateTotalScores", updateTotalScores);


export default platformRouter;
