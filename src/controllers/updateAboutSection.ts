import { Request, Response } from "express";
import Joi from "joi";
import UserModel from "../models/User";

const updateAboutSectionSchema = Joi.object({
  aboutSection: Joi.string().min(1).max(500).required(),
});

export type UpdateAboutSectionRequest = {
  aboutSection: string;
};

const updateAboutSection = async (req: Request, res: Response) => {
  try {
    await updateAboutSectionSchema.validateAsync(req.body);
  } catch (err) {
    console.error(err);
    return res.sendStatus(400);
  }

  const { aboutSection } = req.body as UpdateAboutSectionRequest;
  const username = res.locals.authenticatedUser;

  try {
    const user = await UserModel.retrieveByUsername(username);

    if (!user) {
      console.error(`${username} not found in database`);
      return res.sendStatus(400);
    }

    user.aboutSection = aboutSection;

    await user.update();

    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default updateAboutSection;
