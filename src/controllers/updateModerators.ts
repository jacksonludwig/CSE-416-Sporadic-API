import { Request, Response } from "express";
import Joi from "joi";
import PlatformModel from "../models/Platform";
import UserModel from "../models/User";

const updateModeratorsSchema = Joi.object({
  targetUsername: Joi.string().alphanum().min(1).max(40).required(),
  action: Joi.string().valid(Sporadic.UpdateAction.Add, Sporadic.UpdateAction.Remove).required(),
});

export type UpdateModeratorsRequest = {
  targetUsername: string;
  action: Sporadic.UpdateAction;
};

const updateModerators = async (req: Request, res: Response) => {
  try {
    await updateModeratorsSchema.validateAsync(req.body);
  } catch (err) {
    console.error(err);
    return res.sendStatus(400);
  }

  const { targetUsername, action } = req.body as UpdateModeratorsRequest;
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

    if (user.permissionsOn(platform) < Sporadic.Permissions.Moderator) {
      console.error(`${username} is not an owner or moderator of ${platformTitle}`);
      return res.sendStatus(403);
    }

    const hasUserAsModerator = platform.moderators.includes(targetUsername);

    if (action === Sporadic.UpdateAction.Add) {
      if (hasUserAsModerator) {
        console.error(`${targetUsername} is already a moderator`);
        return res.sendStatus(400);
      }
      platform.moderators.push(targetUsername);
    } else {
      if (!hasUserAsModerator) {
        console.error(`${targetUsername} is not a moderator`);
        return res.sendStatus(400);
      }
      platform.moderators = platform.moderators.filter((m) => m !== targetUsername);
    }

    await platform.update();

    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default updateModerators;
