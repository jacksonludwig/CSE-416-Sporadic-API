import { Request, Response } from "express";
import Joi from "joi";
import PlatformModel from "../models/Platform";

const createPlatformSchema = Joi.object({
  title: Joi.string().alphanum().min(3).max(100).required(),
  moderators: Joi.array().items(Joi.string().min(3).max(40)),
});

export type CreatePlatformPost = {
  title: string;
  moderators?: string[];
};

const createPlatform = async (req: Request, res: Response) => {
  try {
    await createPlatformSchema.validateAsync(req.body);
  } catch (err) {
    console.error(err);
    return res.sendStatus(400);
  }

  const { title, moderators } = req.body as CreatePlatformPost;

  try {
    if (await PlatformModel.retrieveByTitle(title)) {
      console.error(`${title} already exists`);
      return res.sendStatus(400);
    }

    const platform = new PlatformModel({
      title: title,
      moderators: moderators,
      owner: res.locals.authenticatedUser,
    });

    await platform.save();
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }

  return res.sendStatus(204);
};

export default createPlatform;
