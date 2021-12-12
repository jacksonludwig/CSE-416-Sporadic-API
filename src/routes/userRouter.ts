import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import express from "express";
import confirmEmail from "../controllers/confirmEmail";
import createUser from "../controllers/createUser";
import generateAvatarSubmissionURL from "../controllers/generateAvatarSubmissionURL";
import retrieveByUsername from "../controllers/retrieveUserByUsername";
import updateAboutSection from "../controllers/updateAboutSection";
import updateGlobalBanStatus from "../controllers/updateGlobalBanStatus";
import updateRelationship from "../controllers/updateRelationship";
import updateShowcasedAwards from "../controllers/updateShowcasedAwards";
import { validateToken } from "../middleware/auth";

const userRouter = express.Router();

export const cognitoClient = new CognitoIdentityProviderClient({
  region: "us-east-1",
});

userRouter.post("/", createUser);
userRouter.post("/:username/confirm", confirmEmail);
userRouter.get("/:username/set-avatar", validateToken, generateAvatarSubmissionURL);

userRouter.get("/:username", validateToken, retrieveByUsername);

userRouter.put("/updateRelationship", validateToken, updateRelationship);
userRouter.put("/updateShowcasedAwards", validateToken, updateShowcasedAwards)
userRouter.patch("/about", validateToken, updateAboutSection);
userRouter.patch("/updateGlobalBanStatus", validateToken, updateGlobalBanStatus);

export default userRouter;
