import express, { Request, Response } from "express";
import Joi from "joi";
import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import UserModel from "../models/User";
import { validateToken } from "../middleware/auth";
import createUser from "./controllers/createUser";

const router = express.Router();

const confirmEmailSchema = Joi.object({
  confirmCode: Joi.string().alphanum().min(3).max(15).required(),
});

export type ConfirmEmailPost = {
  confirmCode: string;
};

export const cognitoClient = new CognitoIdentityProviderClient({
  region: "us-east-1",
});

router.post("/", createUser);

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

export default router;
