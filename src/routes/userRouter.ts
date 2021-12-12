import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import express from "express";
import confirmEmail from "../controllers/confirmEmail";
import createUser from "../controllers/createUser";
import generateAvatarSubmissionURL from "../controllers/generateAvatarSubmissionURL";
import retrieveByUsername from "../controllers/retrieveUserByUsername";
import updateAboutSection from "../controllers/updateAboutSection";
import updateGlobalBanStatus from "../controllers/updateGlobalBanStatus";
import updateRelationship from "../controllers/updateRelationship";
import updateDisplayedAwards from "../controllers/updateDisplayedAwards";
import { validateToken } from "../middleware/auth";
import resendConfirmationEmail from "../controllers/resendConfirmationCode";

const userRouter = express.Router();

export const cognitoClient = new CognitoIdentityProviderClient({
  region: "us-east-1",
});

userRouter.post("/", createUser);
userRouter.post("/:username/confirm", confirmEmail);
userRouter.post("/:username/resendConfirmationCode", resendConfirmationEmail);
userRouter.get("/:username/set-avatar", validateToken, generateAvatarSubmissionURL);

userRouter.get("/:username", validateToken, retrieveByUsername);

userRouter.put("/updateRelationship", validateToken, updateRelationship);
userRouter.put("/updateDisplayedAwards", validateToken, updateDisplayedAwards);
userRouter.patch("/about", validateToken, updateAboutSection);
userRouter.patch("/updateGlobalBanStatus", validateToken, updateGlobalBanStatus);

export default userRouter;
