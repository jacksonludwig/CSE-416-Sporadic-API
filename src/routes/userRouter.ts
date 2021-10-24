import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import express from "express";
import confirmEmail from "../controllers/confirmEmail";
import createUser from "../controllers/createUser";
import retrieveByUsername from "../controllers/retrieveUserByUsername";
import { validateToken } from "../middleware/auth";

const router = express.Router();

export const cognitoClient = new CognitoIdentityProviderClient({
  region: "us-east-1",
});

router.post("/", createUser);

router.get("/:username", validateToken, retrieveByUsername);

router.post("/:username/confirm", confirmEmail);

export default router;
