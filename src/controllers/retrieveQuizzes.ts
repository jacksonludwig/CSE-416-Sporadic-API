import { Request, Response } from "express";
import Joi from "joi";
import { SortDirection } from "mongodb";
import PlatformModel from "../models/Platform";
import QuizModel from "../models/Quiz";
import UserModel from "../models/User";

enum SortDirs {
  Ascending = "ascending",
  Descending = "descending",
}

const dirMap = new Map<string, SortDirection>([
  [SortDirs.Ascending, 1],
  [SortDirs.Descending, -1],
]);

const retrieveQuizzesSchema = Joi.object({
  platform: Joi.string().min(1).max(50).required(),
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

  const username = res.locals.authenticatedUser;
  const platformTitle = req.query.platform as string;

  try {
    const user = await UserModel.retrieveByUsername(username);

    if (!user) throw Error(`${username} not found in database`);

    const platform = await PlatformModel.retrieveByTitle(platformTitle);

    if (!platform) {
      console.error(`${platformTitle} does not exist`);
      return res.sendStatus(400);
    }

    if (user.permissionsOn(platform) < Sporadic.Permissions.User) {
      console.error(`${username} lacks permission to fetch quizzes for ${platform}`);
      return res.sendStatus(403);
    }

    const quizzes = await QuizModel.retrieveAll(
      {
        platform: platformTitle,
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
