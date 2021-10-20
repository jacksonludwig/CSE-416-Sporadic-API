import express, { Request, Response } from "express";
import Joi from "joi";
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import DbClient from "../utils/DbClient";

const router = express.Router();

const userPostValidation = Joi.object({
  username: Joi.string().alphanum().min(3).max(40).required(),
  password: Joi.string().min(7).max(50).required(),
  email: Joi.string().email().required(),
});

export type UserPostData = {
  username: string;
  email: string;
  password: string;
};

export const cognitoClient = new CognitoIdentityProviderClient({
  region: "us-east-1",
});

router.post("/", async (req: Request, res: Response) => {
  try {
    await userPostValidation.validateAsync(req.body);
  } catch (err) {
    return res.sendStatus(404);
  }

  const { username, email, password } = req.body as UserPostData;

  const command = new SignUpCommand({
    ClientId: process.env.COGNITO_APP_CLIENT_ID,
    UserAttributes: [
      {
        Name: "email",
        Value: email,
      },
    ],
    Username: username,
    Password: password,
  });

  let cognitoId: string | undefined;

  try {
    const response = await cognitoClient.send(command);
    cognitoId = response.UserSub;

    await DbClient.insertOne("users", {
      username: username,
      email: email,
      password: password,
      lastLogin: new Date().toISOString(),
    });
  } catch (err) {
    return res.sendStatus(500);
  }

  res.status(200).send({ cognitoId });
});

export default router;
