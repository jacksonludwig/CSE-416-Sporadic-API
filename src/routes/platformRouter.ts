import express from "express";
import createPlatform from "../controllers/createPlatform";
import retrieveByTitle from "../controllers/retrievePlatformByTitle";
import subscribeUserToPlatform from "../controllers/subscribeUserToPlatform";
import unsubscribeUserFromPlatform from "../controllers/unsubscribeUserFromPlatform";
<<<<<<< HEAD
=======
import updateBannedUsers from "../controllers/updateBannedUsers";
>>>>>>> BUILD_5
import updateModerators from "../controllers/updateModerators";
import { validateToken } from "../middleware/auth";

const platformRouter = express.Router();
platformRouter.use(validateToken);

platformRouter.post("/", createPlatform);

platformRouter.get("/:platformTitle", retrieveByTitle);

platformRouter.patch("/:platformTitle/subscribe", subscribeUserToPlatform);
platformRouter.patch("/:platformTitle/unsubscribe", unsubscribeUserFromPlatform);

platformRouter.put("/:platformTitle/updateModerators", updateModerators);
<<<<<<< HEAD
=======
platformRouter.put("/:platformTitle/updateBannedUsers", updateBannedUsers);
>>>>>>> BUILD_5

export default platformRouter;
