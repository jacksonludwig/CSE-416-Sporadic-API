import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import express from "express";
import confirmEmail from "../controllers/confirmEmail";
import createUser from "../controllers/createUser";
import retrieveById from "../controllers/retrieveUserById";
import { validateToken } from "../middleware/auth";

const router = express.Router();

export const cognitoClient = new CognitoIdentityProviderClient({
  region: "us-east-1",
});

router.post("/", createUser);

router.get("/:id", validateToken, retrieveById);

router.post("/:id/confirm", confirmEmail);

export default router;
