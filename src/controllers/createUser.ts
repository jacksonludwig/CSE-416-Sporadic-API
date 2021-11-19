import { SignUpCommand, SignUpCommandOutput } from "@aws-sdk/client-cognito-identity-provider";
import Joi from "joi";
import UserModel from "../models/User";
import { cognitoClient } from "../routes/userRouter";
import { Request, Response } from "express";

const createUserSchema = Joi.object({
  username: Joi.string().alphanum().min(1).max(40).required(),
  password: Joi.string().min(8).max(50).required(),
  email: Joi.string().email().required(),
});

export type CreateUserPost = {
  username: string;
  email: string;
  password: string;
};

const createUser = async (req: Request, res: Response) => {
  try {
    await createUserSchema.validateAsync(req.body);
  } catch (err) {
    console.error(err);
    return res.sendStatus(400);
  }

  const { username, email, password } = req.body as CreateUserPost;

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

  try {
    if (await UserModel.retrieveByUsername(username)) {
      console.error(`${username} already exists`);
      return res.sendStatus(400);
    }

    let response: SignUpCommandOutput;

    // Cognito can send back an error that may not be 500,
    // this must be propagated to our handler.
    try {
      response = await cognitoClient.send(signUpCommand);
    } catch (err) {
      if (err.$metadata && err.$metadata.httpStatusCode < 500)
        return res.status(err.$metadata.httpStatusCode).send({
          name: err.name,
          message: err.message,
        });
      throw err;
    }

    const user = new UserModel({
      username: username,
      email: email,
      cognitoId: response.UserSub as string,
      lastLogin: new Date(),
      isGloballyBanned: false,
      isGlobalAdmin: false,
      awards: [],
      subscriptions: [],
      friends: [],
      notifications: [],
    });

    await user.save();
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }

  return res.sendStatus(204);
};

export default createUser;
