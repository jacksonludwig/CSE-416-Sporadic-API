import { Request, Response } from "express";
import QuizModel from "../models/Quiz";
import UserModel from "../models/User";
import { SortDirection } from "mongodb";
import Joi from "joi";
import pagesToSkipAndLimit from "../utils/Pagination";

enum SortDirs {
  Ascending = "ascending",
  Descending = "descending",
}

const dirMap = new Map<string, SortDirection>([
  [SortDirs.Ascending, 1],
  [SortDirs.Descending, -1],
]);

const retrieveQuizFeedSchema = Joi.object({
  sortBy: Joi.string().valid("upvotes", "title", "platform"),
  sortDirection: Joi.string().valid(SortDirs.Ascending, SortDirs.Descending),
  page: Joi.number().min(1).max(100000),
  amountPerPage: Joi.number().min(1).max(100),
});

const retrieveQuizFeed = async (req: Request, res: Response) => {
  try {
    await retrieveQuizFeedSchema.validateAsync(req.query);
  } catch (err) {
    console.error(err);
    return res.sendStatus(400);
  }

  const username = res.locals.authenticatedUser;

  const { skip, limit } = pagesToSkipAndLimit(
    Number(req.query.page),
    Number(req.query.amountPerPage),
  );

  const user = await UserModel.retrieveByUsername(username);
  if (!user) throw Error(`${username} not found in database`);

  const subscriptions = user.subscriptions;

  try {
    const quizzes = await QuizModel.retrieveFeed(
      subscriptions,
      {
        field: req.query.sortBy as string,
        direction: dirMap.get(req.query.sortDirection as SortDirs),
      },
      skip,
      limit,
    );
    return res.status(200).send(quizzes);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default retrieveQuizFeed;
