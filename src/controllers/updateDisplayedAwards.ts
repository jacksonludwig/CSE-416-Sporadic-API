import { Request, Response } from "express";
import Joi from "joi";
import UserModel from "../models/User";
import { Award } from "../models/User";

const updateDisplayedAwardsSchema = Joi.object({
  displayedAwards: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().min(1).max(100).required(),
        quiz: Joi.string().min(1).max(100).required(),
        platform: Joi.string().min(1).max(100).required(),
      }),
    )
    .required(),
  awards: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().min(1).max(100).required(),
        quiz: Joi.string().min(1).max(100).required(),
        platform: Joi.string().min(1).max(100).required(),
      }),
    )
    .required(),
});

export type updateDisplayedAwardRequest = {
  displayedAwards: Award[];
  awards: Award[];
};

const updateDisplayedAwards = async (req: Request, res: Response) => {
  try {
    await updateDisplayedAwardsSchema.validateAsync(req.body);
  } catch (err) {
    console.error(err);
    return res.sendStatus(400);
  }

  const { displayedAwards, awards } = req.body as updateDisplayedAwardRequest;
  const username = res.locals.authenticatedUser;

  try {
    const user = await UserModel.retrieveByUsername(username);

    if (!user) {
      console.error(`${username} not found in database`);
      return res.sendStatus(400);
    }

    for (let index = 0; index < displayedAwards.length; index++) {
      if (
        !(
          user.displayedAwards.find(
            (award) =>
              award.platform === displayedAwards[index].platform &&
              award.quiz === displayedAwards[index].quiz &&
              award.title === displayedAwards[index].title,
          ) === undefined
        ) &&
        !(
          user.awards.find(
            (award) =>
              award.platform === displayedAwards[index].platform &&
              award.quiz === displayedAwards[index].quiz &&
              award.title === displayedAwards[index].title,
          ) === undefined
        )
      ) {
        console.log("User did not gain these awards!");
        return res.sendStatus(403);
      }
    }
    for (let index = 0; index < awards.length; index++) {
      if (
        !(
          user.displayedAwards.find(
            (award) =>
              award.platform === awards[index].platform &&
              award.quiz === awards[index].quiz &&
              award.title === awards[index].title,
          ) === undefined
        ) &&
        !(
          user.awards.find(
            (award) =>
              award.platform === awards[index].platform &&
              award.quiz === awards[index].quiz &&
              award.title === awards[index].title,
          ) === undefined
        )
      ) {
        console.log("User did not gain these awards!");
        return res.sendStatus(403);
      }
    }
    user.displayedAwards = displayedAwards;
    user.awards = awards;

    await user.update();

    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default updateDisplayedAwards;
