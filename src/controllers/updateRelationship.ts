import { Request, Response } from "express";
import Joi from "joi";
import UserModel from "../models/User";

enum Action {
  Add = "add",
  Remove = "remove",
}

const updateRelationshipSchema = Joi.object({
  targetUsername: Joi.string().alphanum().min(1).max(40).required(),
  action: Joi.string().valid(Action.Add, Action.Remove).required(),
});

export type UpdateRelationshipRequest = {
  targetUsername: string;
  action: Action;
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

    if (action === Action.Add) {
      if (userHasFriend) {
        console.error(`${username} already has ${targetUsername} as friend`);
        return res.sendStatus(400);
      }
      user.friends.push(targetUsername);
    } else {
      if (!userHasFriend) {
        console.error(`${username} does not have ${targetUsername} as friend`);
        return res.sendStatus(400);
      }
      user.friends = user.friends.filter((f) => f !== targetUsername);
    }

    await user.update();

    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default updateRelationship;
