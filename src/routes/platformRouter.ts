import express from "express";
import createPlatform from "../controllers/createPlatform";
import generatePlatformBannerSubmissionURL from "../controllers/generatePlatformBannerSubmissionURL";
import generatePlatformIconSubmissionURL from "../controllers/generatePlatformIconSubmissionURL";
import retrieveByTitle from "../controllers/retrievePlatformByTitle";
import subscribeUserToPlatform from "../controllers/subscribeUserToPlatform";
import unsubscribeUserFromPlatform from "../controllers/unsubscribeUserFromPlatform";
import updateBannedUsers from "../controllers/updateBannedUsers";
import updateModerators from "../controllers/updateModerators";
import updatePinnedQuizzes from "../controllers/updatePinnedQuizzes";
import { validateToken } from "../middleware/auth";

const platformRouter = express.Router();
platformRouter.use(validateToken);

platformRouter.post("/", createPlatform);

platformRouter.get("/:platformTitle", retrieveByTitle);
platformRouter.get("/:platform/set-banner", validateToken, generatePlatformBannerSubmissionURL);
platformRouter.get("/:platform/set-icon", validateToken, generatePlatformIconSubmissionURL);

platformRouter.patch("/:platformTitle/subscribe", subscribeUserToPlatform);
platformRouter.patch("/:platformTitle/unsubscribe", unsubscribeUserFromPlatform);

platformRouter.put("/:platformTitle/updateModerators", updateModerators);
platformRouter.put("/:platformTitle/updateBannedUsers", updateBannedUsers);
platformRouter.put("/:platformTitle/updatePinnedQuizzes", updatePinnedQuizzes);

export default platformRouter;
