import { Request, Response } from "express";
import Joi from "joi";
import UserModel from "../models/User";

const updateRelationshipSchema = Joi.object({
  targetUsername: Joi.string().alphanum().min(1).max(40).required(),
  action: Joi.string()
    .valid(Sporadic.UpdateAction.Add, Sporadic.UpdateAction.Remove)
    .required(),
});

export type UpdateRelationshipRequest = {
  targetUsername: string;
  action: Sporadic.UpdateAction;
};

const updateRelationship = async (req: Request, res: Response) => {
  try {
    await updateRelationshipSchema.validateAsync(req.body);
  } catch (err) {
    console.error(err);
    return res.sendStatus(400);
  }

  const { targetUsername, action } = req.body as UpdateRelationshipRequest;
  const username = res.locals.authenticatedUser as string;

  try {
    const user = await UserModel.retrieveByUsername(username);

    if (!user) throw Error(`${username} not found in database`);

    const targetUser = await UserModel.retrieveByUsername(targetUsername);

    if (!targetUser) {
      console.error(`${targetUsername} not found in database`);
      return res.sendStatus(400);
    }

    const userHasFriend = user.friends.includes(targetUsername);

    if (action === Sporadic.UpdateAction.Add) {
      if (userHasFriend) {
        console.error(`${username} already has ${targetUsername} as friend`);
        return res.sendStatus(400);
      }

      targetUser.notifications.push({
        title: "User added you to their friends list",
        body: `${username} has made you their friend`,
        hasBeenViewed: false,
      });

      user.friends.push(targetUsername);
    } else {
      if (!userHasFriend) {
        console.error(`${username} does not have ${targetUsername} as friend`);
        return res.sendStatus(400);
      }

      targetUser.notifications.push({
        title: "User has removed you from their friends list",
        body: `${username} is no longer your friend`,
        hasBeenViewed: false,
      });

      user.friends = user.friends.filter((f) => f !== targetUsername);
    }

    await user.update();
    await targetUser.update();

    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default updateRelationship;
