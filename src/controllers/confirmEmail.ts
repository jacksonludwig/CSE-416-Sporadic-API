import { ConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { Request, Response } from "express";
import Joi from "joi";
import UserModel from "../models/User";
import { cognitoClient } from "../routes/userRouter";

export type ConfirmEmailPost = {
  confirmCode: string;
};

const confirmEmailSchema = Joi.object({
  confirmCode: Joi.string().alphanum().min(3).max(15).required(),
});

const confirmEmail = async (req: Request, res: Response) => {
  try {
    await confirmEmailSchema.validateAsync(req.body);
  } catch (err) {
    console.error(err);
    return res.sendStatus(400);
  }

  const { confirmCode } = req.body as ConfirmEmailPost;

  try {
    const user = await UserModel.retrieveByUsername(req.params.username);

    if (!user) return res.sendStatus(400);

    const confirmEmailCommand = new ConfirmSignUpCommand({
      ClientId: process.env.COGNITO_APP_CLIENT_ID,
      Username: user.getUsername(),
      ConfirmationCode: confirmCode,
    });

    // Cognito can send back an error that may not be 500,
    // this must be propagated to our handler.
    try {
      await cognitoClient.send(confirmEmailCommand);
    } catch (err) {
      if (err.$metadata && err.$metadata.httpStatusCode < 500)
        return res.status(err.$metadata.httpStatusCode).send({
          name: err.name,
          message: err.message,
        });
      throw err;
    }

    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default confirmEmail;
