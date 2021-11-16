import { Request, Response } from "express";
import Joi from "joi";
import { SortDirection } from "mongodb";
import QuizModel from "../models/Quiz";

const retrieveQuizzesSchema = Joi.object({
  platform: Joi.string().max(50),
  sortBy: Joi.string().valid("upvotes", "title", "platform"),
  sortDirection: Joi.string().valid("1", "-1"),
});

const retrieveQuizzes = async (req: Request, res: Response) => {
  try {
    await retrieveQuizzesSchema.validateAsync(req.query);
  } catch (err) {
    console.error(err);
    return res.sendStatus(400);
  }

  try {
    const quizzes = await QuizModel.retrieveAll(
      {
        platform: req.query.platform as string,
      },
      {
        field: req.query.sortBy as string,
        direction: req.query.sortDirection as SortDirection,
      },
    );

    return res.status(200).send(quizzes);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default retrieveQuizzes;
