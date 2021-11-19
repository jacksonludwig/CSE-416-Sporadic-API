import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import express from "express";
import confirmEmail from "../controllers/confirmEmail";
import createUser from "../controllers/createUser";
import retrieveQuizFeed from "../controllers/retreiveQuizFeed";
import retrieveByUsername from "../controllers/retrieveUserByUsername";
import updateRelationship from "../controllers/updateRelationship";
import { validateToken } from "../middleware/auth";

const userRouter = express.Router();

export const cognitoClient = new CognitoIdentityProviderClient({
  region: "us-east-1",
});

userRouter.post("/", createUser);
userRouter.post("/:username/confirm", confirmEmail);

userRouter.get("/:username", validateToken, retrieveByUsername);

userRouter.put("/updateRelationship", validateToken, updateRelationship);

userRouter.get("/:username/retreiveQuizFeed", validateToken, retrieveQuizFeed);

export default userRouter;
