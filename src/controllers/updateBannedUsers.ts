import { Request, Response } from "express";
import Joi from "joi";
import PlatformModel from "../models/Platform";
import UserModel from "../models/User";

export enum Action {
  Add = "add",
  Remove = "remove",
}

const updateBannedUsersSchema = Joi.object({
  targetUsername: Joi.string().alphanum().min(1).max(40).required(),
  action: Joi.string().valid(Action.Add, Action.Remove).required(),
});

export type UpdateBannedUsersRequest = {
  targetUsername: string;
  action: Action;
};

const updateBannedUsers = async (req: Request, res: Response) => {
  try {
    await updateBannedUsersSchema.validateAsync(req.body);
  } catch (err) {
    console.error(err);
    return res.sendStatus(400);
  }

  const { targetUsername, action } = req.body as UpdateBannedUsersRequest;
  const username = res.locals.authenticatedUser as string;
  const platformTitle = req.params.platformTitle;

  try {
    const user = await UserModel.retrieveByUsername(username);

    if (!user) throw Error(`${username} not found in database`);

    const targetUser = await UserModel.retrieveByUsername(targetUsername);

    if (!targetUser) {
      console.error(`${targetUsername} not found in database`);
      return res.sendStatus(400);
    }

    const platform = await PlatformModel.retrieveByTitle(platformTitle);

    if (!platform) {
      console.error(`${platformTitle} not found in database`);
      return res.sendStatus(400);
    }

    if (username !== platform.getOwner() && !platform.bannedUsers.includes(username)) {
      console.error(`${username} is not an owner or moderator of ${platformTitle}`);
      return res.sendStatus(403);
    }

    const hasBannedUser = platform.bannedUsers.includes(targetUsername);

    if (action === Action.Add) {
      if (hasBannedUser) {
        console.error(`${targetUsername} is already banned`);
        return res.sendStatus(400);
      }
      platform.bannedUsers.push(targetUsername);
    } else {
      if (!hasBannedUser) {
        console.error(`${targetUsername} is not currently banned`);
        return res.sendStatus(400);
      }
      platform.bannedUsers = platform.bannedUsers.filter((m) => m !== targetUsername);
    }

    await platform.update();

    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default updateBannedUsers;
