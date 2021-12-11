import { Request, Response } from "express";
import Joi from "joi";
import UserModel from "../models/User";
import { Award } from "../models/User";

const updateShowcasedAwardsSchema = Joi.object({
  displayedAwards: Joi.array()
  .items(
    Joi.object({
      title: Joi.string().min(1).max(100).required(),
      quiz: Joi.string().min(1).max(100).required(),
      platform: Joi.string().min(1).max(100).required(),
    })
  )
  .required(),
  awards: Joi.array()
  .items(
    Joi.object({
      title: Joi.string().min(1).max(100).required(),
      quiz: Joi.string().min(1).max(100).required(),
      platform: Joi.string().min(1).max(100).required(),
    })
  )
  .required()
});

export type updateShowcasedAwardRequest = {
  displayedAwards: Award[];
  awards: Award[];
};

const updateShowcasedAwards = async (req: Request, res: Response) => {
  try {
    await updateShowcasedAwardsSchema.validateAsync(req.body);
  } catch (err) {
    console.error(err);
    return res.sendStatus(400);
  }

  const { displayedAwards, awards } = req.body as updateShowcasedAwardRequest;
  const username = res.locals.authenticatedUser;

  try {
    const user = await UserModel.retrieveByUsername(username);

    if (!user) {
      console.error(`${username} not found in database`);
      return res.sendStatus(400);
    }
    displayedAwards.forEach(award => {
      if(!user.displayedAwards.includes(award) && !user.awards.includes(award)){
        console.log('User did not gain these awards!');
        return res.sendStatus(403);
      }
    });
    awards.forEach(award => {
      if(!user.displayedAwards.includes(award) && !user.awards.includes(award)){
        console.log('User did not gain these awards!');
        return res.sendStatus(403);
      }
    });
    user.displayedAwards = displayedAwards;
    user.awards = awards;

    await user.update();

    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default updateShowcasedAwards;
