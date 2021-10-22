import express, { Request, Response } from "express";
import Joi from "joi";
import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import UserModel from "../models/User";
import { validateToken } from "../middleware/auth";

const router = express.Router();

const createUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(40).required(),
  password: Joi.string().min(7).max(50).required(),
  email: Joi.string().email().required(),
});

const confirmEmailSchema = Joi.object({
  confirmCode: Joi.string().alphanum().min(3).max(15).required(),
});

export type CreateUserPost = {
  username: string;
  email: string;
  password: string;
};

export type ConfirmEmailPost = {
  confirmCode: string;
};

export const cognitoClient = new CognitoIdentityProviderClient({
  region: "us-east-1",
});

router.get("/:id", validateToken, async (req: Request, res: Response) => {
  try {
    const user = await UserModel.retrieveById(req.params.id);

    return user ? res.status(200).send(user.toJSON()) : res.sendStatus(400);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

router.post("/:id/confirm", async (req: Request, res: Response) => {
  try {
    await confirmEmailSchema.validateAsync(req.body);
  } catch (err) {
    console.error(err);
    return res.sendStatus(400);
  }

  const { confirmCode } = req.body as ConfirmEmailPost;

  try {
    const user = await UserModel.retrieveById(req.params.id);

    if (!user) return res.sendStatus(400);

    const confirmEmailCommand = new ConfirmSignUpCommand({
      ClientId: process.env.COGNITO_APP_CLIENT_ID,
      Username: user.getUsername(),
      ConfirmationCode: confirmCode,
    });

    // TODO handle <500 errors from cognito
    await cognitoClient.send(confirmEmailCommand);

    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    await createUserSchema.validateAsync(req.body);
  } catch (err) {
    console.error(err);
    return res.sendStatus(400);
  }

  const { username, email, password } = req.body as CreateUserPost;

  if (await UserModel.retrieveByUsername(username)) {
    console.error(`${username} already exists`);
    return res.sendStatus(400);
  }

  const signUpCommand = new SignUpCommand({
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

  let userId: string | undefined;

  try {
    const response = await cognitoClient.send(signUpCommand);

    const user = new UserModel({
      username: username,
      email: email,
      cognitoId: response.UserSub as string,
      lastLogin: new Date(),
    });

    userId = await user.save();
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }

  res.status(200).send({ _id: userId });
});

export default router;
