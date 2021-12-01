import {
  AdminDisableUserCommand,
  AdminEnableUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { Request, Response } from "express";
import Joi from "joi";
import UserModel from "../models/User";
import { cognitoClient } from "../routes/userRouter";

const updateGlobalBanStatusSchema = Joi.object({
  targetUsername: Joi.string().alphanum().min(1).max(40).required(),
  action: Joi.string().valid(Sporadic.BanAction.Ban, Sporadic.BanAction.Unban).required(),
});

export type UpdateGlobalBanStatusRequest = {
  targetUsername: string;
  action: Sporadic.BanAction;
};

const updateGlobalBanStatus = async (req: Request, res: Response) => {
  try {
    await updateGlobalBanStatusSchema.validateAsync(req.body);
  } catch (err) {
    console.error(err);
    return res.sendStatus(400);
  }

  const { targetUsername, action } = req.body as UpdateGlobalBanStatusRequest;
  const username = res.locals.authenticatedUser as string;

  try {
    const user = await UserModel.retrieveByUsername(username);

    if (!user) throw Error(`${username} not found in database`);

    if (!user.getIsGlobalAdmin()) {
      console.error(`${username} is not a global admin`);
      return res.sendStatus(403);
    }

    const targetUser = await UserModel.retrieveByUsername(targetUsername);

    if (!targetUser) {
      console.error(`${targetUsername} not found in database`);
      return res.sendStatus(400);
    }

    const commandParams = {
      UserPoolId: process.env.COGNITO_POOL_ID,
      Username: targetUsername,
    };

    if (action === Sporadic.BanAction.Ban) {
      if (targetUser.isGloballyBanned) {
        console.error(`${targetUsername} is already globally banned`);
        return res.sendStatus(400);
      }

      const disableUserCommand = new AdminDisableUserCommand(commandParams);

      try {
        await cognitoClient.send(disableUserCommand);
      } catch (err) {
        if (err.$metadata && err.$metadata.httpStatusCode < 500)
          return res.status(err.$metadata.httpStatusCode).send({
            name: err.name,
            message: err.message,
          });
        throw err;
      }
    } else {
      if (!targetUser.isGloballyBanned) {
        console.error(`${targetUsername} is not currently banned globally`);
        return res.sendStatus(400);
      }

      const enableUserCommand = new AdminEnableUserCommand(commandParams);

      try {
        await cognitoClient.send(enableUserCommand);
      } catch (err) {
        if (err.$metadata && err.$metadata.httpStatusCode < 500)
          return res.status(err.$metadata.httpStatusCode).send({
            name: err.name,
            message: err.message,
          });
        throw err;
      }
    }

    targetUser.isGloballyBanned = !targetUser.isGloballyBanned;
    await targetUser.update();

    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default updateGlobalBanStatus;
