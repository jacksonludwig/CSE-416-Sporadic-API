import { Request, Response } from "express";
import Joi from "joi";
import PlatformModel from "../models/Platform";
import QuizModel from "../models/Quiz";
import UserModel from "../models/User";

enum SortDirs {
  Ascending = "ascending",
  Descending = "descending",
}

// const dirMap = new Map<string, SortDirection>([
//   [SortDirs.Ascending, 1],
//   [SortDirs.Descending, -1],
// ]);

enum SearchScopes {
  Platforms = "platforms",
  Quizzes = "quizzes",
  Users = "users",
}

const searchSchema = Joi.object({
  sortBy: Joi.string().valid("upvotes", "title", "platform"),
  sortDirection: Joi.string().valid(SortDirs.Ascending, SortDirs.Descending),
  scope: Joi.string().valid(SearchScopes.Platforms, SearchScopes.Quizzes, SearchScopes.Users),
  searchQuery: Joi.string().min(1).max(50).required(),
  skip: Joi.number().min(0).max(100000),
  limit: Joi.number().min(1).max(100),
});

const search = async (req: Request, res: Response) => {
  try {
    await searchSchema.validateAsync(req.query);
  } catch (err) {
    console.error(err);
    return res.sendStatus(400);
  }

  const username = res.locals.authenticatedUser;

  const scope = req.query.scope;
  const searchQuery = req.query.searchQuery as string;
  const skip = Number(req.query.skip as string | undefined);
  const limit = Number(req.query.limit as string | undefined);

  try {
    const user = await UserModel.retrieveByUsername(username);

    if (!user) throw Error(`${username} not found in database`);

    switch (scope) {
      case SearchScopes.Platforms:
        return res.status(200).send(await PlatformModel.searchByTitle(searchQuery, skip, limit));
        break;
      case SearchScopes.Quizzes:
        return res.status(200).send(await QuizModel.searchByTitle(searchQuery, skip, limit));
        break;
      case SearchScopes.Users:
        return res.status(200).send(await UserModel.searchByUsername(searchQuery, skip, limit));
        break;
      default:
        break;
    }

    return res.status(200).send([]);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

export default search;
