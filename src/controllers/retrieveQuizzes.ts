import { Request, Response } from "express";
import Joi from "joi";
import { SortDirection } from "mongodb";
import QuizModel from "../models/Quiz";

enum SortDirs {
  Ascending = "ascending",
  Descending = "descending",
}

const dirMap = new Map<string, SortDirection>([
  [SortDirs.Ascending, 1],
  [SortDirs.Descending, -1],
]);

const retrieveQuizzesSchema = Joi.object({
  platform: Joi.string().max(50),
  sortBy: Joi.string().valid("upvotes", "title", "platform"),
  sortDirection: Joi.string().valid(SortDirs.Ascending, SortDirs.Descending),
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
        direction: dirMap.get(req.query.sortDirection as SortDirs),
      },
    );

    return res.status(200).send(quizzes);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default retrieveQuizzes;
