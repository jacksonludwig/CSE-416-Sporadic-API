import { ResendConfirmationCodeCommand } from "@aws-sdk/client-cognito-identity-provider";
import { Request, Response } from "express";
import UserModel from "../models/User";
import { cognitoClient } from "../routes/userRouter";

export type ResendConfirmationEmailPost = {
  confirmCode: string;
};

const resendConfirmationEmail = async (req: Request, res: Response) => {
  try {
    const user = await UserModel.retrieveByUsername(req.params.username);

    if (!user) return res.sendStatus(400);

    const resendConfirmationEmailCommand = new ResendConfirmationCodeCommand({
      ClientId: process.env.COGNITO_APP_CLIENT_ID,
      Username: user.getUsername(),
    });

    // Cognito can send back an error that may not be 500,
    // this must be propagated to our handler.
    try {
      await cognitoClient.send(resendConfirmationEmailCommand);
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

export default resendConfirmationEmail;
