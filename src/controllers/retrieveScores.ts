import { Request, Response } from "express";
import Joi from "joi";
import PlatformModel from "../models/Platform";

const retrieveScoresSchema = Joi.object({

});

const retrieveScores = async (req: Request, res:Response) => {
  try {
    const platformTitle = req.params.platformTitle;
    const username = res.locals.authenticatedUser as string;

    const platform = await PlatformModel.retrieveByTitle(platformTitle);
    if (!platform) return res.sendStatus(400);

    const scores = platform.scores;

    return res.status(200).send(scores);

  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default retrieveScores;

