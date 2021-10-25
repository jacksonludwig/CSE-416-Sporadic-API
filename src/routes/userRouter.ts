import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import express from "express";
import confirmEmail from "../controllers/confirmEmail";
import createUser from "../controllers/createUser";
import retrieveByUsername from "../controllers/retrieveUserByUsername";
import { validateToken } from "../middleware/auth";

const userRouter = express.Router();

export const cognitoClient = new CognitoIdentityProviderClient({
  region: "us-east-1",
});

userRouter.post("/", createUser);

userRouter.post("/:username/confirm", confirmEmail);

userRouter.get("/:username", validateToken, retrieveByUsername);

export default userRouter;
