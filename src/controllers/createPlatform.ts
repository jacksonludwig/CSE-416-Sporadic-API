import { Request, Response } from "express";
import Joi from "joi";
import PlatformModel from "../models/Platform";

const createPlatformSchema = Joi.object({
  title: Joi.string().alphanum().min(3).max(100).required(),
  description: Joi.string().min(1).max(500).required(),
});

export type CreatePlatformPost = {
  title: string;
  description: string;
};

const createPlatform = async (req: Request, res: Response) => {
  try {
    await createPlatformSchema.validateAsync(req.body);
  } catch (err) {
    console.error(err);
    return res.sendStatus(400);
  }

  const { title, description } = req.body as CreatePlatformPost;
  const username = res.locals.authenticatedUser;

  try {
    if (await PlatformModel.retrieveByTitle(title)) {
      console.error(`${title} already exists`);
      return res.sendStatus(400);
    }

    const platform = new PlatformModel({
      title: title,
      description: description,
      moderators: [username],
      bannedUsers: [],
      subscribers: [],
      quizzes: [],
      owner: username,
    });

    await platform.save();
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }

  return res.sendStatus(204);
};

export default createPlatform;
