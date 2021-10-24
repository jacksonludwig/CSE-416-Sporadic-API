import { SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import Joi from "joi";
import UserModel from "../models/User";
import { cognitoClient } from "../routes/userRouter";
import { Request, Response } from "express";

const createUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(40).required(),
  password: Joi.string().min(7).max(50).required(),
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
};

export default createUser;
